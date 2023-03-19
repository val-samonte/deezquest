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

interface BotMatchProps {
  show: boolean
  onClose?: () => void
}

export default function BotMatchDialog({ show, onClose }: BotMatchProps) {
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
      matchType: MatchTypes.BOT,
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
      title='Practice Match'
      show={show}
      onClose={onClose}
      className='max-w-3xl'
    >
      <div className='flex flex-col max-w-3xl gap-5 mx-auto px-5 bg-neutral-900 rounded'>
        <HeroRollDisplay publicKey={keypair.publicKey}>
          <img
            src={
              'https://shdw-drive.genesysgo.net/52zh6ZjiUQ5UKCwLBwob2k1BC3KF2qhvsE7V4e8g2pmD/SolanaSpaceman.png'
            }
            className='w-full h-full object-contain'
          />
        </HeroRollDisplay>
      </div>
      <div className='flex gap-3 justify-center pt-5 border-t border-t-white/5'>
        <button
          type='button'
          className='px-3 py-2 bg-neutral-700 hover:bg-neutral-600 rounded'
          onClick={() => {
            setKeypair(Keypair.generate())
          }}
        >
          Reroll
        </button>
        <button
          type='button'
          className='portrait:flex-auto px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded flex items-center justify-center'
          onClick={() => startMatch()}
        >
          Start Practice Match
        </button>
      </div>
    </Dialog>
  )
}
