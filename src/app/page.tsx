'use client'

import { useSetAtom } from 'jotai'

import { showMenuAtom } from './MainMenu'

export default function Home() {
  const showMenu = useSetAtom(showMenuAtom)

  return (
    <main className='absolute inset-0 flex flex-col items-center justify-center gap-10'>
      <div className='flex portrait:flex-col items-center justify-center'>
        <img
          src='/Title.png'
          className='portrait:max-w-[80vw] landscape:max-h-[30vh] object-contain'
        />
        <img src='/x.png' className='object-contain aspect-square w-5 m-5' />
        <img
          src='/BUNNiEZ_logo.png'
          className='portrait:max-w-[80vw] landscape:max-h-[30vh] object-contain'
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
