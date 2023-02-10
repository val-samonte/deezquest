import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const Stage = dynamic(() => import('./Stage'), { ssr: false })

export default function Battle() {
  return (
    <main className='flex flex-col landscape:justify-center w-full h-full'>
      <div className='flex-auto flex items-center justify-center'>
        <div className='max-w-[100vw] max-h-[calc(100vh-56px)] landscape:w-full landscape:aspect-[5/3] portrait:h-full portrait:aspect-[3/5] mx-auto bg-black/25'>
          <Suspense fallback={null}>
            <Stage />
          </Suspense>
        </div>
      </div>
      <div className='flex-none h-14 w-full bg-black/50'></div>
    </main>
  )
}
