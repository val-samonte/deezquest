import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import Center from './Center'
import Panel from './Panel'
import Button from './Button'

export default function WalletGuard() {
  const { setVisible } = useWalletModal()

  return (
    <Center>
      <Panel className='max-w-xs'>
        <div className='overflow-auto h-full relative'>
          <p className='px-5 my-5 text-center'>
            Connect your wallet to continue <br />
            <span className='text-sm text-neutral-400'>
              (Please switch to DEVNET)
            </span>
          </p>
          <div className='p-5 flex justify-center sticky bottom-0'>
            <Button onClick={() => setVisible(true)}>Connect Wallet</Button>
          </div>
        </div>
      </Panel>
    </Center>
  )
}
