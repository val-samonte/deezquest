// import dynamic from 'next/dynamic'
// const HeroSelect = dynamic(() => import('./HeroSelect'), { ssr: false })

'use client'

import classNames from 'classnames'
import { atom, useAtom } from 'jotai'

const openAtom = atom(false)

export default function Barracks() {
  const [open, setOpen] = useAtom(openAtom)
  return (
    <div className='flex w-full'>
      <div className='flex-auto overflow-y-auto overflow-x-hidden'>
        <div className='mx-auto max-w-fit'>
          <div
            className={classNames(
              open ? 'min-w-[50vw]' : 'min-w-[60vw]',
              'grid-cols-[repeat(auto-fit,10rem)] xl:grid-cols-[repeat(auto-fit,15rem)]',
              'inline-grid mx-auto gap-3 p-3 xl:gap-5 xl:p-5',
            )}
          >
            <div
              className='w-40 xl:w-60 aspect-[3/4] bg-white/10'
              onClick={() => setOpen((o) => !o)}
            ></div>
            <div className='w-40 xl:w-60 aspect-[3/4] bg-white/10'></div>
            <div className='w-40 xl:w-60 aspect-[3/4] bg-white/10'></div>
            <div className='w-40 xl:w-60 aspect-[3/4] bg-white/10'></div>
            <div className='w-40 xl:w-60 aspect-[3/4] bg-white/10'></div>
            <div className='w-40 xl:w-60 aspect-[3/4] bg-white/10'></div>
            <div className='w-40 xl:w-60 aspect-[3/4] bg-white/10'></div>
            <div className='w-40 xl:w-60 aspect-[3/4] bg-white/10'></div>
            <div className='w-40 xl:w-60 aspect-[3/4] bg-white/10'></div>
            <div className='w-40 xl:w-60 aspect-[3/4] bg-white/10'></div>
            <div className='w-40 xl:w-60 aspect-[3/4] bg-white/10'></div>
            <div className='w-40 xl:w-60 aspect-[3/4] bg-white/10'></div>
            <div className='w-40 xl:w-60 aspect-[3/4] bg-white/10'></div>
            <div className='w-40 xl:w-60 aspect-[3/4] bg-white/10'></div>
            <div className='w-40 xl:w-60 aspect-[3/4] bg-white/10'></div>
            <div className='w-40 xl:w-60 aspect-[3/4] bg-white/10'></div>
            <div className='w-40 xl:w-60 aspect-[3/4] bg-white/10'></div>
            <div className='w-40 xl:w-60 aspect-[3/4] bg-white/10'></div>
            <div className='w-40 xl:w-60 aspect-[3/4] bg-white/10'></div>
            <div className='w-40 xl:w-60 aspect-[3/4] bg-white/10'></div>
            <div className='w-40 xl:w-60 aspect-[3/4] bg-white/10'></div>
            <div className='w-40 xl:w-60 aspect-[3/4] bg-white/10'></div>
          </div>
          <nav
            className={classNames(
              'h-14 xl:h-16 w-full sticky bottom-0 bg-black/50',
              'px-3 xl:px-5 py-3 flex items-center justify-between',
            )}
          >
            <div className='h-full flex items-center whitespace-nowrap'>
              <img
                src='/logo.png'
                className='h-full aspect-square mr-3 xl:mr-5'
              />
              <h1 className='text-lg xl:text-2xl'>Barracks</h1>
            </div>
            <button type='button' className='flex items-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='w-6 h-6'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
                />
              </svg>
              <span className='ml-3'>Menu</span>
            </button>
          </nav>
        </div>
      </div>
      <div
        className={classNames(
          open ? 'w-screen sm:w-[30vw] xl:max-w-md' : 'w-0',
          'h-full flex-none bg-white/10 transition-all duration-500',
          'flex flex-col overflow-hidden relative',
        )}
      >
        <div className='w-screen sm:w-[30vw] xl:max-w-md flex-auto p-3 xl:p-5'>
          <img
            className='max-w-full xl:max-w-xs mx-auto aspect-square rounded'
            src='https://shdw-drive.genesysgo.net/52zh6ZjiUQ5UKCwLBwob2k1BC3KF2qhvsE7V4e8g2pmD/SolanaSpaceman.png'
          />
        </div>
        <div className='flex-none w-screen sm:w-[30vw] xl:max-w-md bg-black/50 h-14 xl:h-16 flex items-center px-3 xl:px-5'>
          <button
            type='button'
            className='mr-3 md:mr-5 flex items-center'
            onClick={() => setOpen(false)}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='w-6 h-6 hidden sm:block'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='w-6 h-6 sm:hidden'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M15.75 19.5L8.25 12l7.5-7.5'
              />
            </svg>

            <span className='ml-2 hidden md:block'>Close</span>
            <span className='ml-2 sm:hidden'>Back</span>
          </button>
          <button
            type='button'
            className='flex-auto px-3 py-2 bg-red-700 hover:bg-red-600 rounded flex items-center justify-center'
          >
            <img src='/BattleIcon.svg' className='w-6 h-6' />
            <span className='ml-2 font-bold uppercase'>Battle</span>
          </button>
        </div>
      </div>
    </div>
  )
}
