import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const Stage = dynamic(() => import('../battle/Stage'), { ssr: false })

export default function Battle() {
  return (
    <main className='flex flex-col landscape:justify-center w-full h-full bg-cover bg-no-repeat bg-center'>
      <div className='flex-auto flex items-center justify-center bg-black/80'>
        <div className='max-w-[100vw] max-h-[calc(100vh-56px)] landscape:w-full landscape:aspect-[5/3] portrait:h-full portrait:aspect-[3/5] mx-auto'>
          <Suspense fallback={null}>
            <Stage />
          </Suspense>
        </div>
      </div>
      <div className='flex-none h-14 w-full bg-black/80'></div>
    </main>
  )
}
