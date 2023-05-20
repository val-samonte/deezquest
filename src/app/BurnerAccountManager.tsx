'use client'

import bs58 from 'bs58'
import classNames from 'classnames'
import { atom, useAtom, useAtomValue } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { sign } from 'tweetnacl'

import { isXNftAtom } from '@/atoms/isXNftAtom'
import { useUserWallet } from '@/atoms/userWalletAtom'
import { Dialog } from '@/components/Dialog'
import { hashv } from '@/utils/hashv'
import { Keypair } from '@solana/web3.js'

// Backend (Dapp) Seed:
// to strengthen the security, an extra seed is given by the backend so that no other dapps
// can derive the burner account.

interface DappSeed {
  publicKey: string
  nonce: string
}
export const dappSeedAtom = atomWithStorage<DappSeed | null>(
  'dapp_seed',
  null,
  createJSONStorage<DappSeed | null>(() => window.sessionStorage),
)

// Burner Account:
// acts as player proxy needed for seamless interaction.
// when the need for on-chain transaction is necessary (eg. funding the burner account)
// we have to save the nonce on-chain so that we can still derive the burner account.

export const burnerNonceAtom = atomWithStorage<string | null>(
  'burner_nonce',
  null,
  createJSONStorage<string | null>(() => window.localStorage),
)
export const burnerKeypairAtom = atom<Keypair | null>(null)

export default function BurnerAccountManager() {
  const wallet = useUserWallet()
  const publicKey = wallet?.publicKey ?? null
  const signMessage = wallet?.signMessage ?? null
  const isXNft = useAtomValue(isXNftAtom)
  const [dappSeed, setDappSeed] = useAtom(dappSeedAtom)
  const [burnerNonce, setBurnerNonce] = useAtom(burnerNonceAtom)
  const [burner, setBurner] = useAtom(burnerKeypairAtom)
  const [errorMsg, setErrorMsg] = useState('')

  // Initialize burnerNonce
  useEffect(() => {
    if (!publicKey) return
    if (burnerNonce) return

    const burnerNonceCheck = async () => {
      // TODO: check PDA for existing saved nonce < higher priority

      const newNonce = bs58.encode(
        window.crypto.getRandomValues(new Uint8Array(16)),
      )

      setBurnerNonce(newNonce)
    }
    burnerNonceCheck()
  }, [publicKey, burnerNonce, setBurnerNonce])

  // Invalidate credentials, except burnerNonce
  useEffect(() => {
    setErrorMsg('')
    if (!publicKey) {
      setBurner(null)
    } else {
      if (dappSeed?.publicKey !== publicKey.toBase58()) {
        setDappSeed(null)
      }
    }
  }, [publicKey, dappSeed, setBurner, setDappSeed, setErrorMsg])

  const [busy, setBusy] = useState(false)
  const signPrerequisites = useCallback(async () => {
    if (!publicKey) return
    if (!signMessage) return
    if (!burnerNonce) return

    setErrorMsg('')
    setBusy(true)

    try {
      // extract dappSeed
      let appSeed = dappSeed?.nonce ? bs58.decode(dappSeed.nonce) : null
      let message = ''
      let signature = ''
      let requireLinking = false

      if (dappSeed?.publicKey !== publicKey.toBase58()) {
        appSeed = null
      }

      if (!appSeed) {
        // sign 1st half
        const nonceResponse = await fetch('/api/request_nonce')
        const nonce = await nonceResponse.text()

        message = `Please sign to prove your public key ownership\n\n${publicKey?.toBase58()}:${nonce}:${burnerNonce}`
        signature = bs58.encode(await signMessage(Buffer.from(message)))
        const payload = JSON.stringify({ message, signature })

        const seedResponse = await fetch('/api/get_burner_seeds', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: payload,
        })

        const response = await seedResponse.json()
        appSeed = bs58.decode(response.data)

        setDappSeed({
          nonce: response.data,
          publicKey: publicKey.toBase58(),
        })

        requireLinking = response.requireLinking
      }

      // TODO: if backpack, burner is stored in storage
      // streamline this with "checkbox" option if user prefers to store keypair in browser
      // implementation note: possible issue when user go through ordinary webpage

      // sign 2nd half
      const signedMessage = await signMessage(
        Buffer.from(
          `Please sign to retrieve your game account ${burnerNonce}`,
          'utf8',
        ),
      )

      const hash = hashv([appSeed, signedMessage.slice(0, 16)])
      const kp = Keypair.fromSeed(hash)

      setBurner(kp)
    } catch (e) {
      console.error(e)
      setErrorMsg(
        e + '', //'An error occurred. If you are using Phantom wallet with multichain beta, you will most likely receive an error when signing.',
      )
    }

    setBusy(false)
  }, [
    isXNft,
    publicKey,
    burnerNonce,
    burner,
    dappSeed,
    signMessage,
    setBurner,
    setDappSeed,
    setErrorMsg,
  ])

  const totalRequiredSigs = useRef(0)
  const requiredSignatures = useMemo(() => {
    if (!publicKey) {
      totalRequiredSigs.current = 0
      return 0
    }
    let ctr = 0

    if (!dappSeed) ctr++

    if (!burner) ctr++

    if (totalRequiredSigs.current === 0 && ctr > 0) {
      totalRequiredSigs.current = ctr
    }

    return ctr
  }, [publicKey, burner, dappSeed])

  return (
    <Dialog show={requiredSignatures > 0 && !!signMessage} className='max-w-sm'>
      {/* {isXNft ? (
        <>
          <p className='text-center px-5 mb-3'>
            Sorry, our xNFT is currently undergoing maintanence!
          </p>
          <p className='text-center px-5 mb-3'>
            Come back soon or visit us on deezquest.vercel.app
          </p>
          <p className='text-center px-5 mb-3'>
            Thank you for your patience<span onClick={() => sign()}>!</span>
          </p>
        </>
      ) : (
        <> */}
      <p className='text-center px-5 mb-5'>
        Please sign using your wallet to continue <br />
        (you <span className='font-bold'>WILL NOT</span> pay anything)
      </p>
      {!isXNft && (
        <p className='text-center px-5 mb-5'>
          Or click here to{' '}
          <button
            tabIndex={2}
            type='button'
            className='underline outline-none'
            onClick={() => wallet?.disconnect()}
          >
            Disconnect Wallet
          </button>{' '}
          instead
        </p>
      )}
      {errorMsg && (
        <p className='mx-5 mb-5 text-red-400 bg-red-800/10 p-5 text-sm rounded'>
          {errorMsg}
        </p>
      )}
      <div className='flex-auto' />
      <div className='px-5'>
        <button
          tabIndex={1}
          type='button'
          disabled={busy}
          className={classNames(
            busy && 'opacity-20',
            'px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded w-full',
          )}
          onClick={() => signPrerequisites()}
        >
          <>
            Sign{' '}
            {Math.min(
              totalRequiredSigs.current - requiredSignatures + 1,
              totalRequiredSigs.current,
            )}{' '}
            of {totalRequiredSigs.current}
          </>
        </button>
      </div>
      {/* </>
      )} */}
    </Dialog>
  )
}
