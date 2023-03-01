import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const Stage = dynamic(() => import('../battle/Stage'), { ssr: false })
const PeerConnectionManager = dynamic(() => import('./PeerConnectionManager'), {
  ssr: false,
})

export default function DemoBattle() {
  return (
    <main className='flex flex-col landscape:justify-center w-full h-full bg-cover bg-no-repeat bg-center'>
      <div className='flex-auto flex items-center justify-center'>
        <div className='max-w-[100vw] max-h-[calc(100vh-56px)] landscape:w-full landscape:aspect-[2/1] portrait:h-full portrait:aspect-[1/2] mx-auto'>
          <Suspense fallback={null}>
            <PeerConnectionManager />
            <Stage />
          </Suspense>
        </div>
      </div>
      <div className='flex-none h-14 w-full flex items-center justify-center'>
        <img src='/DeezQuest.png' className='h-full aspect-square' />
        <span className='text-lg font-bold'>DeezQuest</span>
      </div>
    </main>
  )
}
