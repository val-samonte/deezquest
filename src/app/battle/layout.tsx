'use client'

import MenuIcon from '@/components/MenuIcon'
import PreloaderAnimation from '@/components/PreloaderAnimation'
import classNames from 'classnames'
import { useSetAtom } from 'jotai'
import Link from 'next/link'
import { ReactNode, Suspense } from 'react'
import { showMenuAtom } from '../MainMenu'

export default function BattleLayout({ children }: { children: ReactNode }) {
  const showMenu = useSetAtom(showMenuAtom)
  return (
    <main className='flex flex-col landscape:justify-center w-full h-full bg-cover bg-no-repeat bg-center absolute inset-0'>
      <div
        className={classNames(
          'absolute inset-x-0 top-0 bottom-14 xl:bottom-16',
          'flex-auto flex items-center justify-center',
        )}
      >
        <Suspense fallback={<PreloaderAnimation />}>{children}</Suspense>
      </div>
      <nav
        className={classNames(
          'fixed bottom-0 inset-x-0',
          'h-14 xl:h-16 px-3 xl:px-5 py-3',
          'w-screen sm:w-auto',
          'flex-none flex justify-between bg-neutral-900',
        )}
      >
        <div className='h-full flex items-center whitespace-nowrap'>
          <Link href='/' className='h-full'>
            <img
              src='/logo.png'
              className='h-full aspect-square mr-3 xl:mr-5'
            />
          </Link>
          <h1 className='text-lg xl:text-2xl'>Battle</h1>
        </div>
        <button
          type='button'
          className='flex items-center'
          onClick={() => showMenu(true)}
        >
          <MenuIcon />
          <span className='ml-3'>Menu</span>
        </button>
      </nav>
    </main>
  )
}
