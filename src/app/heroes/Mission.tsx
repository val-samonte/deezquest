import { barracksPathFlagsAtom } from '@/atoms/barracksAtoms'
import Panel from '@/components/Panel'
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
          className={classNames(
            'object-cover object-top landscape:object-center landscape:md:object-left-top portrait:md:object-left-top',
          )}
        />
      </Transition.Child>
      <div
        className={classNames(
          'w-full h-full py-16 landscape:py-5 landscape:lg:py-28',
          'landscape:gap-x-2',
          'portrait:md:gap-y-5 portrait:md:py-28',
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
            'relative',
            // 'bg-red-500',
            'flex items-center justify-center gap-2',
            // phone
            'portrait:flex-row-reverse',
            'landscape:flex-col-reverse',
            'row-span-2 row-start-1 landscape:row-span-6 landscape:row-start-1',
            'col-span-10 col-start-2 landscape:col-span-4 landscape:col-start-2',
            // tablet portrait
            'portrait:md:flex-col-reverse',
            'portrait:md:col-span-9 portrait:md:col-start-3',
            // tablet landscape
            'landscape:row-span-6 landscape:row-start-1',
            // desktop
            'portrait:lg:col-span-5 portrait:lg:row-span-6 portrait:lg:col-start-2 portrait:lg:row-start-1',
            'landscape:lg:col-span-5 landscape:lg:row-span-6 landscape:lg:col-start-2 landscape:lg:row-start-1',
          )}
        >
          <div
            className={classNames(
              'landscape:text-center landscape:md:text-left',
            )}
          >
            <h2 className={classNames('text-2xl xl:text-4xl')}>Ranked Match</h2>
            <p className={classNames('')}>Battle on-chain & earn DeezCoins.</p>
          </div>
          <div
            className={classNames(
              'relative',
              'portrait:h-full portrait:aspect-square portrait:max-w-[50%]',
              'landscape:w-full landscape:aspect-[2/1]',
              'portrait:md:w-full portrait:md:aspect-[2/1] portrait:md:max-w-none',
            )}
          >
            <Image
              alt='colosseum'
              src={`${process.env.NEXT_PUBLIC_CDN}/iso_colosseum_sketch.png`}
              fill={true}
              className='object-contain'
            />
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
            'relative',
            // 'bg-blue-500',
            'mission-item cursor-pointer hover:scale-105 transition-all',
            'flex items-center justify-center gap-2 py-5',
            // phone
            'portrait:flex-row-reverse',
            'landscape:flex-col-reverse',
            'row-span-2 row-start-3 landscape:row-span-6 landscape:row-start-1',
            'col-span-10 col-start-2 landscape:col-span-3 landscape:col-start-6',
            // tablet portrait
            'portrait:md:flex-col-reverse',
            'portrait:md:col-span-9 portrait:md:col-start-3',
            // tablet landscape
            'landscape:row-span-6 landscape:row-start-1',
            // desktop
            'portrait:xl:flex-row landscape:xl:flex-row',
            'portrait:lg:col-span-5 portrait:lg:row-span-2 portrait:lg:col-start-7 portrait:lg:row-start-1',
            'landscape:lg:col-span-5 landscape:lg:row-span-3 landscape:lg:col-start-7 landscape:lg:row-start-1',
          )}
        >
          <Panel
            className={classNames(
              'ribbon absolute inset-0 bg-black/80',
              'xl:inset-y-[30%] xl:h-[40%]',
            )}
          />
          <div
            className={classNames(
              'relative px-5',
              'landscape:text-center landscape:md:text-left',
            )}
          >
            <h2 className={classNames('text-2xl xl:text-4xl')}>Practice</h2>
            <p className={classNames('')}>Play against NPCs.</p>
          </div>

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
            'relative',
            // 'bg-green-500',
            'mission-item cursor-pointer hover:scale-105 transition-all',
            'flex items-center justify-center gap-2 py-5',
            // phone
            'portrait:flex-row-reverse',
            'landscape:flex-col-reverse',
            'row-span-2 row-start-5 landscape:row-span-6 landscape:row-start-1',
            'col-span-10 col-start-2 landscape:col-span-3 landscape:col-start-9',
            // tablet portrait
            'portrait:md:flex-col-reverse',
            'portrait:md:col-span-9 portrait:md:col-start-3',
            // tablet landscape
            'landscape:row-span-6 landscape:row-start-1',
            // desktop
            'portrait:xl:flex-row-reverse landscape:xl:flex-row-reverse',
            'portrait:lg:col-span-5 portrait:lg:row-span-2 portrait:lg:col-start-7 portrait:lg:row-start-3',
            'landscape:lg:col-span-5 landscape:lg:row-span-3 landscape:lg:col-start-7 landscape:lg:row-start-4',
          )}
        >
          <Panel
            className={classNames(
              'ribbon absolute inset-0 bg-black/80',
              'xl:inset-y-[30%] xl:h-[40%]',
            )}
          />
          <div
            className={classNames(
              'relative px-5',
              'landscape:text-center landscape:md:text-left',
            )}
          >
            <h2 className={classNames('text-2xl xl:text-4xl')}>Friendly</h2>
            <p className={classNames('')}>Play against friends.</p>
          </div>
          <LocationPicture name='arena' />
        </Transition.Child>
      </div>
    </Transition>
  )
}

function LocationPicture({ name }: { name: string }) {
  return (
    <div
      className={classNames(
        'aspect-square relative md:p-10',
        'portrait:h-full portrait:max-w-[50%] landscape:w-full',
        'portrait:md:w-full portrait:md:max-w-none',
        'portrait:xl:h-full landscape:xl:h-full landscape:xl:w-auto',
      )}
    >
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
