'use client'

import BackIcon from '@/components/BackIcon'
import CloseIcon from '@/components/CloseIcon'
import MenuIcon from '@/components/MenuIcon'
import classNames from 'classnames'
import { atom, useAtom, useSetAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { showMenuAtom } from '../MainMenu'
import { HeroCard } from './HeroCard'

const openAtom = atom(true)

export default function Barracks() {
  const router = useRouter()
  const [open, setOpen] = useAtom(openAtom)
  const showMenu = useSetAtom(showMenuAtom)

  return (
    <div className='flex w-full'>
      <div
        className={classNames(
          open && 'w-0 sm:w-auto',
          'overflow-hidden',
          'flex-auto flex flex-col',
        )}
      >
        <div className='w-screen sm:w-auto flex-auto overflow-y-auto overflow-x-hidden p-3 xl:p-5'>
          <div className='flex flex-wrap justify-center gap-3 xl:gap-5'>
            <HeroCard onClick={() => setOpen((o) => !o)} />
            <HeroCard onClick={() => setOpen((o) => !o)} />
            <HeroCard onClick={() => setOpen((o) => !o)} />
            <HeroCard onClick={() => setOpen((o) => !o)} />
            <HeroCard onClick={() => setOpen((o) => !o)} />
            <HeroCard onClick={() => setOpen((o) => !o)} />
            <HeroCard onClick={() => setOpen((o) => !o)} />
          </div>
        </div>
        <nav
          className={classNames(
            'h-14 xl:h-16 px-3 xl:px-5 py-3',
            'w-screen sm:w-auto',
            'flex-none flex justify-between bg-white/10',
          )}
        >
          <div className='h-full flex items-center whitespace-nowrap'>
            <img
              src='/logo.png'
              className='h-full aspect-square mr-3 xl:mr-5'
            />
            <h1 className='text-lg xl:text-2xl'>Barracks</h1>
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
      </div>
      <div
        className={classNames(
          open ? 'w-screen sm:w-[35vw] xl:w-[25vw]' : 'w-0',
          'transition-all duration-500',
          'flex-none flex flex-col bg-white/5',
        )}
      >
        <div
          className={classNames(
            'w-screen sm:w-[35vw] xl:w-[25vw]',
            'flex-auto overflow-y-auto overflow-x-hidden p-3 xl:p-5',
          )}
        >
          <div className='flex flex-col'>
            <img
              className='w-full xl:max-w-xs mx-auto aspect-square rounded'
              src='https://shdw-drive.genesysgo.net/52zh6ZjiUQ5UKCwLBwob2k1BC3KF2qhvsE7V4e8g2pmD/SolanaSpaceman.png'
            />
          </div>
        </div>
        <div
          className={classNames(
            'w-screen sm:w-[35vw] xl:w-[25vw]',
            'flex-none h-14 xl:h-16 bg-white/10',
            'flex items-center px-3 xl:px-5',
          )}
        >
          <button
            type='button'
            className='mr-3 md:mr-5 portrait:mr-5 flex items-center'
            onClick={() => setOpen(false)}
          >
            <BackIcon />
            <CloseIcon />
            <span className='ml-2 hidden md:block'>Close</span>
            <span className='ml-2 sm:hidden'>Back</span>
          </button>
          <button
            type='button'
            className={classNames(
              'flex-auto px-3 py-2',
              'flex items-center justify-center',
              'bg-red-700 hover:bg-red-600 rounded',
            )}
          >
            <img src='/BattleIcon.svg' className='w-6 h-6' />
            <span className='ml-2 font-bold uppercase'>Battle</span>
          </button>
        </div>
      </div>
    </div>
  )
}
