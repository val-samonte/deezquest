import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const Stage = dynamic(() => import('../battle/Stage'), { ssr: false })
const PeerConnectionManager = dynamic(() => import('./PeerConnectionManager'), {
  ssr: false,
})

export default function DemoBattle() {
  return (
    <main className='flex flex-col landscape:justify-center w-full h-full bg-cover bg-no-repeat bg-center absolute inset-0'>
      <div className='flex-auto flex items-center justify-center absolute inset-0'>
        <div className='max-w-full max-h-full landscape:w-full landscape:aspect-[2/1] portrait:h-full portrait:aspect-[1/2] mx-auto'>
          <Suspense fallback={null}>
            <PeerConnectionManager />
            <Stage />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
