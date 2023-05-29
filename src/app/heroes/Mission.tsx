import { barracksPathFlagsAtom } from '@/atoms/barracksAtoms'
import Center from '@/components/Center'
import { Transition } from '@headlessui/react'
import classNames from 'classnames'
import { useAtomValue } from 'jotai'
import { IM_Fell_DW_Pica } from 'next/font/google'
import Image from 'next/image'

const font = IM_Fell_DW_Pica({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

const mask =
  'linear-gradient(125deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 60%)'

export default function Mission() {
  const { mission } = useAtomValue(barracksPathFlagsAtom)

  return (
    <Transition
      show={mission}
      className={classNames(
        'pointer-events-auto',
        'absolute inset-0 w-full h-full',
        'flex-auto py-5 flex items-center justify-center',
      )}
    >
      <div
        className={classNames(
          'pointer-events-none',
          // 'pl-20 landscape:-ml-20',
          'w-full max-w-[80vh] aspect-square -rotate-45',
          'grid grid-rows-5 landscape:gap-[2vh] portrait:gap-[2vw]',
        )}
      >
        <div className='row-span-3'>
          <Transition.Child
            enter='ease-out duration-500 delay-700'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-out duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
            className={classNames(
              'border-l border-t border-amber-400/50',
              'h-full aspect-square relative flex items-center justify-center',
            )}
          >
            <div
              className='absolute inset-1 overflow-hidden sepia opacity-90 brightness-50'
              style={{
                WebkitMaskImage: mask,
                maskImage: mask,
              }}
            >
              <Image
                fill={true}
                alt='Ranked Match'
                src={`${process.env.NEXT_PUBLIC_CDN}/bg_arena.png`}
                className='object-cover rotate-45 scale-150 '
              />
            </div>
            <div className='h-[50%] aspect-square absolute -top-1 -left-1 border-l-4 border-t-4 border-amber-400/50' />
            <div className='relative mt-20 ml-14 w-96 rotate-45'>
              <h2 className={classNames('text-5xl', font.className)}>
                Ranked Game
              </h2>
              <div className='h-1 w-full my-2 bg-gradient-to-r from-amber-400/50 to-amber-400/0' />
              <p className='text-neutral-300 mb-2'>
                Challenge other players on-chain and earn DeezCoins whenever you
                win the match.
              </p>
              <p className='text-neutral-300 italic'>Coming Soon</p>
            </div>
          </Transition.Child>
        </div>
        <div className='row-span-2 grid grid-cols-3 landscape:gap-[2vh] portrait:gap-[2vw]'>
          <div className='h-full portrait:hidden' />
          <div className='h-full'>
            <Transition.Child
              enter='ease-out duration-500 delay-500'
              enterFrom='opacity-0'
              enterTo='opacity-100'
              leave='ease-out duration-200'
              leaveFrom='opacity-100'
              leaveTo='opacity-0'
              className={classNames(
                'transition-all duration-300 hover:scale-110 cursor-pointer',
                'border-l border-t border-amber-400/50',
                'w-full aspect-square relative flex items-center justify-center',
              )}
            >
              <div
                className={classNames(
                  'transition-all duration-300 pointer-events-auto',
                  'absolute inset-1 overflow-hidden sepia opacity-80 brightness-50',
                  'hover:sepia-0 hover:brightness-100',
                )}
                style={{
                  WebkitMaskImage: mask,
                  maskImage: mask,
                }}
              >
                <Image
                  fill={true}
                  alt='Ranked Match'
                  src={`${process.env.NEXT_PUBLIC_CDN}/bg_ruins.png`}
                  className='object-cover rotate-45 scale-150 '
                />
              </div>
              <div className='h-[30%] aspect-square absolute -top-1 -left-1 border-l-4 border-t-4 border-amber-400/50' />
              <div className='relative mt-14 ml-14 w-96 rotate-45'>
                <h2 className={classNames('text-4xl', font.className)}>
                  Friendly
                </h2>
                <div className='h-1 w-full my-1 bg-gradient-to-r from-amber-400/50 to-amber-400/0' />
                <p className='text-neutral-300 mb-2'>
                  Play against your friend.
                </p>
              </div>
            </Transition.Child>
          </div>
          <div className='h-full'>
            <Transition.Child
              enter='ease-out duration-500 delay-300'
              enterFrom='opacity-0'
              enterTo='opacity-100'
              leave='ease-out duration-200'
              leaveFrom='opacity-100'
              leaveTo='opacity-0'
              className={classNames(
                'transition-all duration-300 hover:scale-110 cursor-pointer',
                'border-l border-t border-amber-400/50',
                'w-full aspect-square relative flex items-center justify-center',
              )}
            >
              <div
                className={classNames(
                  'transition-all duration-300 pointer-events-auto',
                  'absolute inset-1 overflow-hidden sepia opacity-80 brightness-50',
                  'hover:sepia-0 hover:brightness-100',
                )}
                style={{
                  WebkitMaskImage: mask,
                  maskImage: mask,
                }}
              >
                <Image
                  fill={true}
                  alt='Ranked Match'
                  src={`${process.env.NEXT_PUBLIC_CDN}/bg_mission.png`}
                  className='object-cover rotate-45 scale-150 '
                />
              </div>
              <div className='h-[30%] aspect-square absolute -top-1 -left-1 border-l-4 border-t-4 border-amber-400/50' />
              <div className='relative mt-14 ml-14 w-96 rotate-45'>
                <h2 className={classNames('text-4xl', font.className)}>
                  Pratice
                </h2>
                <div className='h-1 w-full my-1 bg-gradient-to-r from-amber-400/50 to-amber-400/0' />
                <p className='text-neutral-300 mb-2'>
                  Play against a bot off-chain.
                </p>
              </div>
            </Transition.Child>
          </div>
        </div>
      </div>
    </Transition>
  )
}
