import { useWalletModal } from '@solana/wallet-adapter-react-ui'

export default function WalletGuard() {
  const { setVisible } = useWalletModal()

  return (
    <div className='absolute inset-0 flex flex-col items-center justify-center'>
      <div className='relative flex flex-col items-center justify-center gap-5 p-5'>
        <p className='text-center sm:text-lg xl:text-xl'>
          Please connect your wallet to continue
        </p>
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
