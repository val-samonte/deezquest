import { Keypair } from '@solana/web3.js'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { HeroCard } from './HeroCard'

export default function HeroContentPage() {
  const router = useRouter()
  const pathname = usePathname()
  const sub = useMemo(
    () => `${pathname}/${Keypair.generate().publicKey.toBase58()}`,
    [pathname],
  )

  return (
    <div className='w-screen sm:w-auto flex-auto overflow-y-auto overflow-x-hidden p-3 xl:p-5'>
      <div className='flex flex-wrap justify-center gap-3 xl:gap-5'>
        <HeroCard onClick={() => router.push(sub)} />
        <HeroCard onClick={() => router.push(sub)} />
        <HeroCard onClick={() => router.push(sub)} />
        <HeroCard onClick={() => router.push(sub)} />
        <HeroCard onClick={() => router.push(sub)} />
        <HeroCard onClick={() => router.push(sub)} />
        <HeroCard onClick={() => router.push(sub)} />
        <HeroCard onClick={() => router.push(sub)} />
      </div>
    </div>
  )
}
