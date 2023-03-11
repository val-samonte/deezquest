'use client'

import dynamic from 'next/dynamic'
// import { Suspense } from 'react'

// const Stage = dynamic(() => import('./Stage'), { ssr: false })

export default function Battle() {
  return (
    <main className='flex flex-col landscape:justify-center w-full h-full bg-cover bg-no-repeat bg-center absolute inset-0'>
      <div className='flex-auto flex items-center justify-center absolute inset-0'>
        <div className='max-w-full max-h-full landscape:w-full landscape:aspect-[2/1] portrait:h-full portrait:aspect-[1/2] mx-auto'>
          {/* <Suspense fallback={null}>
            <Stage />
          </Suspense> */}
        </div>
      </div>
    </main>
    // <main
    //   className='flex flex-col landscape:justify-center w-full h-full bg-cover bg-no-repeat bg-center'
    //   style={{ backgroundImage: 'url("/bgwoods.png")' }}
    // >
    //   <div className='flex-auto flex items-center justify-center bg-black/80'>
    //     <div className='max-w-[100vw] max-h-[calc(100vh-56px)] landscape:w-full landscape:aspect-[5/3] portrait:h-full portrait:aspect-[3/5] mx-auto'>
    //       <Suspense fallback={null}>
    //         <Stage />
    //       </Suspense>
    //     </div>
    //   </div>
    //   <div className='flex-none h-14 w-full bg-black/80'>
    //     <img src='/DeezQuest.png' className='h-full aspect-square' />
    //   </div>
    // </main>
  )
}
