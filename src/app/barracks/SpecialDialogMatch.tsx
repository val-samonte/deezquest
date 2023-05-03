import { matchAtom } from '@/atoms/matchAtom'
import { Dialog } from '@/components/Dialog'
import { PublicKey } from '@solana/web3.js'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { burnerKeypairAtom } from '../BurnerAccountManager'
import SpecialEventDisplay from './SpecialEventDisplay'
import {
  CentralizedMatchResponse,
  InitCentralizedMatchPayload,
} from '@/types/CentralizedMatch'
import { sign } from 'tweetnacl'
import canonicalize from 'canonicalize'
import bs58 from 'bs58'

interface BotMatchProps {
  show: boolean
  onClose?: () => void
}

export const botTurnsAtom = atom<any>([])

export default function SpecialDialogMatch({ show, onClose }: BotMatchProps) {
  const burner = useAtomValue(burnerKeypairAtom)
  const router = useRouter()
  const pathname = usePathname()
  const nftAddress = useMemo(() => {
    if (!pathname) return null
    const parts = pathname.split('/')
    const address = parts[parts.length - 1]
    try {
      new PublicKey(address)
    } catch (e) {
      return null
    }

    return address
  }, [pathname])

  const setMatch = useSetAtom(matchAtom)
  const setBotTurns = useSetAtom(botTurnsAtom)

  const startMatch = useCallback(async () => {
    if (!burner?.publicKey) return
    if (!nftAddress) return

    const player = burner.publicKey.toBase58()

    const nonceResponse = await fetch('/api/request_nonce')
    const nonce = await nonceResponse.text()

    const payload = {
      publicKey: player,
      nft: nftAddress,
      nonce,
    }

    const signature = bs58.encode(
      sign.detached(Buffer.from(canonicalize(payload)!), burner.secretKey),
    )

    const initializeResponse = await fetch(
      '/api/centralized_match/initialize',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload,
          signature,
        } as InitCentralizedMatchPayload),
      },
    )

    const initialize =
      (await initializeResponse.json()) as CentralizedMatchResponse

    const dappSignature = initialize.signature

    window.localStorage.setItem('temp', JSON.stringify(initialize))
    window.localStorage.setItem('dappSignature', dappSignature)

    setMatch(initialize.response.match)

    if (initialize.botTurns) {
      setBotTurns(initialize.botTurns)
    }

    router.push('/battle')
  }, [burner, nftAddress, router, setMatch])

  return (
    <Dialog
      title='DARK BUNNiEZ'
      show={show}
      onClose={onClose}
      className='max-w-3xl'
    >
      <div className='flex flex-col max-w-3xl w-full gap-5 mx-auto px-5 bg-neutral-900 rounded relative'>
        <div
          className='absolute inset-x-0 -inset-y-5 opacity-50 brightness-50'
          style={{
            background: 'url("/bg_ruins.png")',
            backgroundBlendMode: 'multiply',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>
        <div className='relative flex flex-col w-full gap-5'>
          <SpecialEventDisplay>
            <img
              src={'/evil_bunniez1.jpg'}
              className='w-full h-full object-contain'
              style={{ transform: 'scaleX(-1)' }}
            />
          </SpecialEventDisplay>
          <div className='flex gap-3 justify-center pt-5 px-5'>
            <button
              type='button'
              className='portrait:flex-auto px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded flex items-center justify-center'
              onClick={() => startMatch()}
            >
              Hop Into Battle
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
