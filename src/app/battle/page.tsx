'use client'

import { matchAtom } from '@/atoms/matchAtom'
import { useUserWallet } from '@/atoms/userWalletAtom'
import PreloaderAnimation from '@/components/PreloaderAnimation'
import WalletGuard from '@/components/WalletGuard'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useAtomValue } from 'jotai'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Battle() {
  // check match
  // if matchType === ranked, check on-chain PDA
  // redirect user
  const wallet = useUserWallet()
  const router = useRouter()
  const match = useAtomValue(matchAtom)
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    if (!match) {
      setShowDialog(true)
      return
    }
    // TODO: preload here? what about Suspense fallback?
    if (match.matchType === 'friendly' && match.gameHash) {
      router.push(`/battle/${match.gameHash}`)
    }
  }, [match, router, setShowDialog])

  if (!wallet?.connected) {
    return <WalletGuard />
  }

  if (showDialog) {
    return (
      <div className='absolute inset-0 flex flex-col items-center justify-center'>
        <div className='relative flex flex-col items-center justify-center gap-5 p-5'>
          <p className='text-center sm:text-lg xl:text-xl'>
            You do not have an existing match
          </p>
          <Link
            href='/barracks'
            className='px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded'
          >
            Head back to barracks
          </Link>
        </div>
      </div>
    )
  }

  return <PreloaderAnimation />
}
