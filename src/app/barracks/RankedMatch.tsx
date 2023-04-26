'use client'

import { programAtom } from '@/atoms/programAtom'
import { useUserWallet } from '@/atoms/userWalletAtom'
import { Dialog } from '@/components/Dialog'
import SpinnerIcon from '@/components/SpinnerIcon'
import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'

interface RankedMatchProps {
  show: boolean
  onClose?: () => void
}

export default function RankedMatch({ show, onClose }: RankedMatchProps) {
  const wallet = useUserWallet()
  const program = useAtomValue(programAtom)
  const [showRegistration, setShowRegistration] = useState(false)

  useEffect(() => {
    if (!wallet?.publicKey || !program) {
      onClose?.()
    }

    if (show) {
      // check token account
    }
  }, [wallet, program, show])

  return (
    <>
      <Dialog
        title='Ranked Match'
        show={show}
        className='max-w-sm'
        onClose={onClose}
      >
        {/* <p className='px-5 mb-5 text-center'>Looking for a match...</p>
        <div className='flex-auto flex items-center justify-center'>
          <SpinnerIcon />
        </div> */}
        <div className='flex-auto flex items-center justify-center px-5 mb-5 text-center'>
          Matchmaking feature coming soon! <br />
          Stay tuned at @deezquest twitter.
        </div>
        <div className='px-5 flex'></div>
      </Dialog>
    </>
  )
}
