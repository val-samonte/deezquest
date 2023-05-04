import { matchAtom } from '@/atoms/matchAtom'
import { Dialog } from '@/components/Dialog'
import { PublicKey } from '@solana/web3.js'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { burnerKeypairAtom } from '../BurnerAccountManager'
import SpecialEventDisplay, { playerStatusAtom } from './SpecialEventDisplay'
import {
  CentralizedMatchResponse,
  InitCentralizedMatchPayload,
} from '@/types/CentralizedMatch'
import { sign } from 'tweetnacl'
import canonicalize from 'canonicalize'
import bs58 from 'bs58'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import classNames from 'classnames'

interface BotMatchProps {
  show: boolean
  onClose?: () => void
}

export const botTurnsAtom = atomWithStorage<any[]>(
  'botTurns',
  [],
  createJSONStorage<any[]>(() => window.localStorage),
)

export const dappSignatureAtom = atomWithStorage<string>(
  'dappSignature',
  '',
  createJSONStorage<string>(() => window.localStorage),
)

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
  const setDappSignature = useSetAtom(dappSignatureAtom)
  const [busy, setBusy] = useState(false)
  const playerStatus = useAtomValue(playerStatusAtom)

  const hasEnergy = useMemo(() => {
    if (typeof playerStatus.energy !== 'number') return undefined
    return playerStatus.energy > 0
  }, [playerStatus])

  const startMatch = useCallback(async () => {
    if (!burner?.publicKey) return
    if (!nftAddress) return

    const player = burner.publicKey.toBase58()
    setBusy(true)
    try {
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

      setDappSignature(
        [
          initialize.response.nonce,
          initialize.response.order,
          initialize.signature,
        ].join('_'),
      )
      initialize.response.match && setMatch(initialize.response.match)

      if (initialize.botTurns) {
        setBotTurns(initialize.botTurns)
      }

      router.push('/battle')
    } catch (e) {
      console.error(e)
      setBusy(false)
    }
  }, [burner, nftAddress, router, setMatch, setBusy])

  const ctaDisplay = useMemo(() => {
    if (typeof hasEnergy === 'undefined') return 'Checking Energy...'
    if (hasEnergy === false) return 'Not Enough Energy'
    if (busy) return 'Hopping In...'
    return 'Hop Into Battle'
  }, [busy, hasEnergy])

  return (
    <Dialog
      title='DARK BUNNiEZ'
      show={show}
      onClose={onClose}
      className='max-w-3xl'
      padVertical={false}
    >
      <div className='flex flex-col max-w-3xl w-full gap-5 mx-auto p-5 bg-neutral-900 rounded relative'>
        <div
          className='absolute inset-0 opacity-30'
          style={{
            background: 'url("/BUNNiEZ_img.png")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        />
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
              disabled={busy || !hasEnergy}
              type='button'
              className={classNames(
                (busy || !hasEnergy) &&
                  'bg-purple-900 hover:bg-purple-900 text-neutral-500 brightness-50',
                'portrait:flex-auto px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded flex items-center justify-center',
              )}
              onClick={() => startMatch()}
            >
              {ctaDisplay}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
