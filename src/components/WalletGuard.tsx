'use client'

import { useWalletModal } from '@solana/wallet-adapter-react-ui'

export default function WalletGuard() {
  const { setVisible } = useWalletModal()

  return (
    <div className='absolute inset-0 flex flex-col items-center justify-center'>
      <div className='relative pointer-events-none grayscale brightness-50 max-w-xs w-full'>
        <img
          src='/sym_3.png'
          className='h-24 w-24 absolute -top-[8rem] -left-[1rem]'
        />
        <img
          src='/sym_4.png'
          className='h-28 w-28 absolute -left-[5rem] -bottom-[12rem]'
        />
        <img
          src='/sym_5.png'
          className='h-24 w-24 absolute -right-[1rem] -bottom-[15rem]'
        />
        <img
          src='/sym_6.png'
          className='h-20 w-20 absolute -right-[5rem] -bottom-[2rem]'
        />
      </div>
      <div className='relative flex flex-col items-center justify-center gap-5 p-5'>
        <p className='text-center'>Please connect your wallet to continue</p>
        <button
          type='button'
          className='px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded'
          onClick={() => setVisible(true)}
        >
          Connect
        </button>
      </div>
    </div>
  )
}
