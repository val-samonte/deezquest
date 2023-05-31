import { barracksPathFlagsAtom } from '@/atoms/barracksAtoms'
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
  'linear-gradient(105deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 70%)'

export default function Mission() {
  const { mission } = useAtomValue(barracksPathFlagsAtom)

  return (
    <Transition
      show={mission}
      className={classNames(
        'pointer-events-auto',
        'absolute inset-0',
        'flex flex-auto py-5 items-center justify-center',
      )}
    >
      <Transition.Child
        enter='ease-out duration-300'
        enterFrom='opacity-0 translate-y-10'
        enterTo='opacity-100 translate-y-0'
        leave='ease-out duration-200 delay-100'
        leaveFrom='opacity-100 translate-y-0'
        leaveTo='opacity-0 translate-y-10'
        className={classNames(
          'pointer-events-none select-none ml-0 sm:-ml-5 xl:ml-0',
          'absolute inset-x-0 top-0 bottom-4 md:bottom-0',
        )}
      >
        <Image
          alt='mission'
          fill={true}
          src={`${process.env.NEXT_PUBLIC_CDN}/bg_map_alpha.png`}
          className={classNames('object-cover object-top md:object-left-top')}
        />
      </Transition.Child>
      <div
        className={classNames(
          'w-full h-full py-16 landscape:py-5',
          'grid grid-cols-12 grid-rows-6',
          'xl:text-xl text-amber-950 leading-4',
          font.className,
        )}
      >
        <Transition.Child
          enter='ease-out duration-300 delay-100'
          enterFrom='opacity-0 scale-110'
          enterTo='opacity-100 scale-100'
          leave='ease-out duration-200'
          leaveFrom='opacity-100 scale-100'
          leaveTo='opacity-0 scale-90'
          className={classNames(
            'relative bg-red-500',
            'flex flex-col items-center justify-center gap-5',
            // phone
            'row-span-2 row-start-1 landscape:row-span-5 landscape:row-start-2',
            'col-span-10 col-start-2 landscape:col-span-4 landscape:col-start-2',
            // tablet portrait
            'portrait:sm:col-span-9 portrait:sm:col-start-3',
            // desktop
            'xl:col-span-5 xl:row-span-4 xl:col-start-2 xl:row-start-1',
          )}
        >
          <div className='w-full aspect-[2/1] relative'>
            <Image
              alt='colosseum'
              src={`${process.env.NEXT_PUBLIC_CDN}/iso_colosseum_sketch.png`}
              fill={true}
              className='object-contain'
            />
          </div>

          <div className='max-w-sm mx-auto px-5'>
            <h2 className={classNames('text-3xl xl:text-4xl')}>Ranked Match</h2>
            <p className={classNames('text-lg xl:text-xl')}>
              Challenge other players on-chain and earn DeezCoins whenever you
              win the match (Coming Soon).
            </p>
          </div>
        </Transition.Child>
        <Transition.Child
          enter='ease-out duration-300 delay-300'
          enterFrom='opacity-0 scale-110'
          enterTo='opacity-100 scale-100'
          leave='ease-out duration-200'
          leaveFrom='opacity-100 scale-100'
          leaveTo='opacity-0 scale-90'
          className={classNames(
            'relative bg-blue-500',
            'mission-item cursor-pointer hover:scale-105 transition-all',
            'flex flex-row-reverse items-center justify-center gap-5',
            // phone
            'row-span-2 row-start-3 landscape:row-span-5 landscape:row-start-2',
            'col-span-10 col-start-2 landscape:col-span-3 landscape:col-start-6',
            // tablet portrait
            'portrait:sm:col-span-9 portrait:sm:col-start-3',
            // desktop
            'xl:col-span-5 xl:row-span-2 xl:col-start-7 xl:row-start-1',
          )}
        >
          {/* 
          <div
            className={classNames(
              'absolute -inset-x-5 w-full py-5 pl-5 pr-[50%] flex justify-end ',
            )}
          >
            <div
              className={classNames(
                'ribbon absolute inset-0',
                'bg-gradient-to-r from-black/0 via-black to-black/0 w-full',
                'border-y-2 border-amber-400/50 shadow-lg',
              )}
            />
            <div className='relative'>
              <h2 className={classNames('text-3xl xl:text-4xl')}>Practice</h2>
              <p className={classNames('text-lg xl:text-xl whitespace-nowrap')}>
                Play against NPCs.
              </p>
            </div>
          </div> 
          */}
          <LocationPicture name='plains' />
        </Transition.Child>
        <Transition.Child
          enter='ease-out duration-300 delay-500'
          enterFrom='opacity-0 scale-110'
          enterTo='opacity-100 scale-100'
          leave='ease-out duration-200'
          leaveFrom='opacity-100 scale-100'
          leaveTo='opacity-0 scale-90'
          className={classNames(
            'relative bg-green-500',
            'mission-item cursor-pointer hover:scale-105 transition-all',
            'flex items-center justify-center gap-5',
            // phone
            'row-span-2 row-start-5 landscape:row-span-5 landscape:row-start-2',
            'col-span-10 col-start-2 landscape:col-span-3 landscape:col-start-9',
            // tablet portrait
            'portrait:sm:col-span-9 portrait:sm:col-start-3',
            // desktop
            'xl:col-span-5 xl:row-span-2 xl:col-start-7 xl:row-start-3',
          )}
        >
          {/* 
          <div
            className={classNames(
              'absolute -inset-x-5 w-full py-5 pr-5 pl-[60%]',
            )}
          >
            <div
              className={classNames(
                'ribbon absolute inset-0',
                'bg-gradient-to-r from-black/0 via-black to-black/0 w-full',
                'border-y-2 border-amber-400/50 shadow-lg',
              )}
            />
            <h2 className={classNames('relative text-3xl xl:text-4xl')}>
              Friendly
            </h2>
            <p
              className={classNames(
                'relative text-lg xl:text-xl whitespace-nowrap',
              )}
            >
              Play against friends.
            </p>
          </div> 
          */}
          <LocationPicture name='arena' />
        </Transition.Child>
      </div>
    </Transition>
  )
}

function LocationPicture({ name }: { name: string }) {
  return (
    <div className='h-full aspect-square relative'>
      <Image
        alt={name}
        src={`${process.env.NEXT_PUBLIC_CDN}/iso_${name}.png`}
        fill={true}
        className='m-shadow object-contain brightness-0 blur-sm transition-all duration-300'
      />
      <Image
        alt={name}
        src={`${process.env.NEXT_PUBLIC_CDN}/iso_${name}_sketch.png`}
        fill={true}
        className='object-contain'
      />
      <Image
        alt={name}
        src={`${process.env.NEXT_PUBLIC_CDN}/iso_${name}.png`}
        fill={true}
        className='location-picture object-contain'
      />
    </div>
  )
}
