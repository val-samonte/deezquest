import { matchAtom } from '@/atoms/matchAtom'
import { useUserWallet } from '@/atoms/userWalletAtom'
import { Dialog } from '@/components/Dialog'
import { MatchTypes } from '@/enums/MatchTypes'
import { combinePublicKeysAsHash } from '@/utils/combinePublicKeysAsHash'
import { Keypair, PublicKey } from '@solana/web3.js'
import { useSetAtom } from 'jotai'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import HeroRollDisplay from './HeroRollDisplay'
import SpecialEventDisplay from './SpecialEventDisplay'

interface BotMatchProps {
  show: boolean
  onClose?: () => void
}

export default function SpecialDialogMatch({ show, onClose }: BotMatchProps) {
  const wallet = useUserWallet()
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
  const [keypair, setKeypair] = useState(Keypair.generate())
  const setMatch = useSetAtom(matchAtom)

  const startMatch = useCallback(() => {
    if (!wallet?.publicKey) return
    if (!nftAddress) return

    const opponent = keypair.publicKey.toBase58()
    const player = wallet.publicKey.toBase58()

    setMatch({
      matchType: MatchTypes.SPECIAL,
      gameHash: combinePublicKeysAsHash(player, opponent, true) as string,
      ongoing: true,
      opponent: {
        nft: opponent,
        publicKey: opponent,
      },
      player: {
        nft: nftAddress,
        publicKey: player,
      },
    })

    router.push('/battle')
  }, [wallet, nftAddress, router, keypair, setMatch])

  return (
    <Dialog
      title='The EVIL BUNNiEZ'
      show={show}
      onClose={onClose}
      className='max-w-3xl'
    >
      <div className='flex flex-col max-w-3xl w-full gap-5 mx-auto px-5 bg-neutral-900 rounded'>
        <SpecialEventDisplay>
          <img
            src={'/evil_bunniez2.jpg'}
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
    </Dialog>
  )
}
