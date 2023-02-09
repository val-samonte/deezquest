import BurnerWalletDemo from './BurnerWalletDemo'
import WalletButton from './WalletButton'

export default function Home() {
  return (
    <main className='flex flex-col items-center p-5 gap-5'>
      <WalletButton />
      <BurnerWalletDemo />
    </main>
  )
}
