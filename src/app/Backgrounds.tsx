'use client'

import classNames from 'classnames'
import { usePathname } from 'next/navigation'

const commonClasses =
  'absolute inset-0 w-full h-full object-cover blur-sm transition-all duration-500'

export default function Backgrounds() {
  const pathname = usePathname()
  return (
    <div className='fixed inset-0'>
      <img
        src='/bg_arena.png'
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
          'object-bottom brightness-50',
        )}
      />
      {/* <img
        src='/bg_arena.png'
        className={classNames(commonClasses, 
          pathname?.includes('/battle') ? 'opacity-100' : 'opacity-0',
          'object-bottom brightness-50')}
      /> */}
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
        src='/bg_ruins.png'
        className={classNames(
          commonClasses,
          pathname?.includes('/tutorial') ? 'opacity-100' : 'opacity-0',
          'brightness-50',
        )}
      />
    </div>
  )
}
