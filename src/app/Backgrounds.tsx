'use client'

import { barracksPathFlagsAtom } from '@/atoms/barracksAtoms'
import classNames from 'classnames'
import { useAtomValue } from 'jotai'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const commonClasses =
  'absolute inset-0 w-full h-full object-cover transition-all duration-500'

export default function Backgrounds() {
  const {
    pathname,
    level1: barracks1,
    level2: barracks2,
    loadout,
    mission,
  } = useAtomValue(barracksPathFlagsAtom)

  // return null

  return (
    <div className='fixed inset-0'>
      <Image
        alt='arena'
        src={`${process.env.NEXT_PUBLIC_CDN}/bg_arena.png`}
        fill={true}
        className={classNames(
          commonClasses,
          pathname.includes('/battle') ? 'opacity-100' : 'opacity-0',
          'blur-sm object-bottom brightness-75',
        )}
      />
      <Image
        alt='barracks'
        fill={true}
        src={`${process.env.NEXT_PUBLIC_CDN}/bg_barracks.png`}
        className={classNames(
          commonClasses,
          pathname.includes('/heroes') && !barracks2
            ? 'opacity-100'
            : 'opacity-0',
          'blur-sm brightness-50',
        )}
      />
      <Image
        alt='plains'
        fill={true}
        src={`${process.env.NEXT_PUBLIC_CDN}/bg_mission.png`}
        className={classNames(
          commonClasses,
          pathname === '/' || !pathname ? 'opacity-100' : 'opacity-0',
          'blur-sm object-bottom brightness-75',
        )}
      />
      <Image
        alt='bar'
        fill={true}
        src={`${process.env.NEXT_PUBLIC_CDN}/bg_bar.png`}
        className={classNames(
          commonClasses,
          pathname.includes('/tavern') ? 'opacity-100' : 'opacity-0',
          'blur-sm brightness-50',
        )}
      />
      <Image
        alt='library'
        fill={true}
        src={`${process.env.NEXT_PUBLIC_CDN}/bg_library.png`}
        className={classNames(
          commonClasses,
          pathname.includes('/tutorial') ? 'opacity-100' : 'opacity-0',
          'blur-sm brightness-50',
        )}
      />
      <Image
        alt='mission'
        fill={true}
        src={`${process.env.NEXT_PUBLIC_CDN}/bg_mission.png`}
        className={classNames(
          commonClasses,
          mission ? 'opacity-100' : 'opacity-0',
          'brightness-50',
        )}
      />
      <Image
        alt='loadout'
        fill={true}
        src={`${process.env.NEXT_PUBLIC_CDN}/bg_loadout.png`}
        className={classNames(
          commonClasses,
          loadout ? 'opacity-100' : 'opacity-0',
          'blur-sm brightness-75',
        )}
      />
    </div>
  )
}
