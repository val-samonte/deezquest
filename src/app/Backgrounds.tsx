'use client'

import { matchAtom } from '@/atoms/matchAtom'
import { MatchTypes } from '@/enums/MatchTypes'
import classNames from 'classnames'
import { useAtomValue } from 'jotai'
import { usePathname } from 'next/navigation'

const commonClasses =
  'absolute inset-0 w-full h-full object-cover blur-sm transition-all duration-500'

export default function Backgrounds() {
  const pathname = usePathname()
  const match = useAtomValue(matchAtom)
  return (
    <div className='fixed inset-0'>
      <img
        src={'/bg_arena.png'}
        className={classNames(
          commonClasses,
          pathname?.includes('/battle') ? 'opacity-100' : 'opacity-0',
          'object-bottom brightness-75',
        )}
      />
      <img
        src='/bg_barracks.png'
        className={classNames(
          commonClasses,
          pathname?.includes('/barracks') ? 'opacity-100' : 'opacity-0',
          'brightness-50',
        )}
      />
      <img
        src='/bg_plains.png'
        className={classNames(
          commonClasses,
          pathname === '/' ? 'opacity-100' : 'opacity-0',
          'object-bottom brightness-75 blur-none',
        )}
      />
      <img
        src='/bg_shop.png'
        className={classNames(
          commonClasses,
          pathname?.includes('/shop') ? 'opacity-100' : 'opacity-0',
          'object-bottom brightness-75',
        )}
      />
      <img
        src='/bg_storage.png'
        className={classNames(
          commonClasses,
          pathname?.includes('/inventory') ? 'opacity-100' : 'opacity-0',
          'object-bottom brightness-50',
        )}
      />
      <img
        src='/bg_bar.png'
        className={classNames(
          commonClasses,
          pathname?.includes('/pub') ? 'opacity-100' : 'opacity-0',
          'brightness-50',
        )}
      />
      <img
        src='/bg_library.png'
        className={classNames(
          commonClasses,
          pathname?.includes('/tutorial') ? 'opacity-100' : 'opacity-0',
          'brightness-50',
        )}
      />
    </div>
  )
}
