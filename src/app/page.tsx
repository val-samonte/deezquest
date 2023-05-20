'use client'

import Image from 'next/image'
import { showMenuAtom } from '@/atoms/menuAtom'
import { useSetAtom } from 'jotai'

export default function Home() {
  const showMenu = useSetAtom(showMenuAtom)

  return (
    <main className='absolute inset-0 flex flex-col items-center justify-center gap-10'>
      <div className='flex portrait:flex-col items-center justify-center'>
        <Image
          alt='DeezQuest'
          src={`${process.env.NEXT_PUBLIC_CDN}/Title.png`}
          className='portrait:max-w-[80vw] landscape:max-h-[40vh] object-contain'
          width={2118}
          height={1106}
          priority
        />
      </div>
      <button
        className='text-2xl underline animate-pulse'
        onClick={() => showMenu(true)}
      >
        START GAME
      </button>
    </main>
  )
}
