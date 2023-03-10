'use client'

import { useUserWallet } from '@/atoms/userWalletAtom'
import { Keypair } from '@solana/web3.js'
import { atom, useAtom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import bs58 from 'bs58'
import { Dialog } from '@/components/Dialog'
import classNames from 'classnames'
import { getNextHash } from '@/utils/getNextHash'

// Backend (Dapp) Seed:
// to strengthen the security, an extra seed is given by the backend so that no other dapps
// can derive the burner account. this will be stored in localstorage.

interface DappSeed {
  publicKey: string
  nonce: string
}
export const dappSeedAtom = atomWithStorage<DappSeed | null>(
  'dapp_seed',
  null,
  createJSONStorage<DappSeed | null>(() => window.localStorage),
)

// Burner Account:
// to create a burner account as player proxy for seamless tasks.
// when the need for on-chain interaction is necessary (eg. funding the burner account)
// we have to save the nonce on-chain so that we can still derive the burner account.

export const burnerNonceAtom = atomWithStorage<string | null>(
  'burner_nonce',
  null,
  createJSONStorage<string | null>(() => window.localStorage),
)
export const burnerKeypairAtom = atom<Keypair | null>(null)

// Peer Connection:
// NOTE: STORING THE NONCE IS NOT REQUIRED DURING FRIENDLY MATCHES
// for p2p, we need another nonce as well, which is colocated in the same PDA with
// the burner nonce. eg.
//
// export const peerIdAtom = atom((get) => {
//   const kp = get(burnerKeypairAtom)
//   return kp ? getNextHash([kp.publicKey.toBytes(), Buffer.from('[ON_CHAIN_P2P_NONCE]')]) : null
// })
//
// opponent simply needs to listen to the PDA account for any p2p_nonce changes OR
// the player can submit another ping message to the opponent, making the opponent dismiss the old peer connection.
// as long as the player can sign the message using the burner account, opponent can always verify
// the authencity of the message.

// Accepting Match:
// if both parties agreed to start the match (in p2p), both will exchange the code solution
// to solve each respective code challenge stored in the "MatchAccountPDA"

export default function BurnerAccountManager() {
  const wallet = useUserWallet()
  const publicKey = wallet?.publicKey ?? null
  const signMessage = wallet?.signMessage ?? null
  const [dappSeed, setDappSeed] = useAtom(dappSeedAtom)
  const [burnerNonce, setBurnerNonce] = useAtom(burnerNonceAtom)
  const [burner, setBurner] = useAtom(burnerKeypairAtom)
  const [errorMsg, setErrorMsg] = useState('')

  // Initialize burnerNonce
  useEffect(() => {
    if (!publicKey) return
    // TODO: check PDA for existing saved nonce
    if (burnerNonce) return

    const newNonce = bs58.encode(
      window.crypto.getRandomValues(new Uint8Array(16)),
    )
    setBurnerNonce(newNonce)
  }, [publicKey, burnerNonce, setBurnerNonce])

  useEffect(() => {
    if (!publicKey) {
      setBurner(null)
    }
  }, [setBurner])

  const [busy, setBusy] = useState(false)
  const sign = useCallback(async () => {
    if (!publicKey) return
    if (!signMessage) return
    if (!burnerNonce) return

    setBusy(true)
    try {
      // extract dappSeed
      let appSeed = dappSeed?.nonce ? bs58.decode(dappSeed.nonce) : null

      if (dappSeed?.publicKey !== publicKey.toBase58()) {
        appSeed = null
      }

      if (!appSeed) {
        // sign 1st half
        const nonceResponse = await fetch('/api/request_nonce')
        const nonce = await nonceResponse.text()

        const message = `Please sign to prove your public key ownership\n\n${publicKey?.toBase58()}:${nonce}`
        const signature = bs58.encode(await signMessage(Buffer.from(message)))
        const payload = JSON.stringify({ message, signature })

        const seedResponse = await fetch('/api/get_burner_seeds', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: payload,
        })

        const { data } = await seedResponse.json()
        appSeed = bs58.decode(data)

        setDappSeed({
          nonce: data,
          publicKey: publicKey.toBase58(),
        })
      }

      // sign 2nd half
      const signedMessage = await signMessage(
        Buffer.from(`Please sign to retrieve your burner account`, 'utf8'),
      )

      const hash = getNextHash([appSeed, signedMessage.slice(0, 16)])
      const kp = Keypair.fromSeed(hash)

      setBurner(kp)
    } catch (e) {
      console.error(e)
      setErrorMsg(
        'An error occurred. If you are using Phantom wallet with multichain beta, you will most likely receive an error when signing.',
      )
    }

    setBusy(false)
  }, [
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

    if (dappSeed?.publicKey !== publicKey.toBase58()) {
      setDappSeed(null)
    }

    if (!dappSeed) ctr++

    if (!burner) ctr++

    if (totalRequiredSigs.current === 0 && ctr > 0) {
      totalRequiredSigs.current = ctr
    }

    return ctr
  }, [publicKey, burner, dappSeed, setDappSeed])

  return (
    <Dialog show={requiredSignatures > 0 && !!signMessage} className='max-w-sm'>
      <p className='text-center px-5 mb-5'>
        Please sign using your wallet to continue <br />
        (you <span className='font-bold'>WILL NOT</span> pay anything)
      </p>
      <p className='text-center px-5 mb-5'>
        Click here to{' '}
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
          onClick={() => sign()}
        >
          <>
            Sign {totalRequiredSigs.current - requiredSignatures + 1} of{' '}
            {totalRequiredSigs.current}
          </>
        </button>
      </div>
    </Dialog>
  )
}
