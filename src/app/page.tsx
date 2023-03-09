'use client'

import { useSetAtom } from 'jotai'
import { showMenuAtom } from './MainMenu'

export default function Home() {
  const showMenu = useSetAtom(showMenuAtom)

  return (
    <main className='absolute inset-0 flex flex-col items-center justify-center gap-10'>
      <img
        src='/Title.png'
        className='portrait:max-w-[80vw] landscape:max-h-[50vh] object-contain'
      />
      <button
        className='text-2xl underline animate-pulse'
        onClick={() => showMenu(true)}
      >
        Game Start
      </button>
    </main>
  )
}
