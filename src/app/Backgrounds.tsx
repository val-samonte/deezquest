'use client'

import classNames from 'classnames'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const commonClasses =
  'absolute inset-0 w-full h-full object-cover blur-sm transition-all duration-500'

export default function Backgrounds() {
  const pathname = usePathname()
  return (
    <div className='fixed inset-0'>
      <Image
        alt='arena'
        src={`${process.env.NEXT_PUBLIC_CDN}/bg_arena.png`}
        fill={true}
        className={classNames(
          commonClasses,
          pathname?.includes('/battle') ? 'opacity-100' : 'opacity-0',
          'object-bottom brightness-75',
        )}
      />
      <Image
        alt='barracks'
        fill={true}
        src={`${process.env.NEXT_PUBLIC_CDN}/bg_barracks.png`}
        className={classNames(
          commonClasses,
          pathname?.includes('/barracks') ? 'opacity-100' : 'opacity-0',
          'brightness-50',
        )}
      />
      <Image
        alt='plains'
        fill={true}
        src={`${process.env.NEXT_PUBLIC_CDN}/bg_plains.png`}
        className={classNames(
          commonClasses,
          pathname === '/' ? 'opacity-100' : 'opacity-0',
          'object-bottom brightness-75 blur-none',
        )}
      />
      <Image
        alt='shop'
        fill={true}
        src={`${process.env.NEXT_PUBLIC_CDN}/bg_shop.png`}
        className={classNames(
          commonClasses,
          pathname?.includes('/shop') ? 'opacity-100' : 'opacity-0',
          'object-bottom brightness-75',
        )}
      />
      <Image
        alt='storage'
        fill={true}
        src={`${process.env.NEXT_PUBLIC_CDN}/bg_storage.png`}
        className={classNames(
          commonClasses,
          pathname?.includes('/inventory') ? 'opacity-100' : 'opacity-0',
          'object-bottom brightness-50',
        )}
      />
      <Image
        alt='bar'
        fill={true}
        src={`${process.env.NEXT_PUBLIC_CDN}/bg_bar.png`}
        className={classNames(
          commonClasses,
          pathname?.includes('/pub') ? 'opacity-100' : 'opacity-0',
          'brightness-50',
        )}
      />
      <Image
        alt='library'
        fill={true}
        src={`${process.env.NEXT_PUBLIC_CDN}/bg_library.png`}
        className={classNames(
          commonClasses,
          pathname?.includes('/tutorial') ? 'opacity-100' : 'opacity-0',
          'brightness-50',
        )}
      />
    </div>
  )
}
