import { Transition } from '@headlessui/react'
import { ReactNode } from 'react'
import Image from 'next/image'
import classNames from 'classnames'

export default function PreloaderAnimation({
  children,
  className,
}: {
  children?: ReactNode
  className?: string
}) {
  return (
    <Transition
      appear={true}
      show={true}
      enter='transition-opacity duration-500'
      enterFrom='opacity-0'
      enterTo='opacity-100'
      className={classNames(
        'absolute inset-0 flex flex-col items-center justify-center backdrop-grayscale',
        className,
      )}
    >
      <div className='absolute inset-0 flex items-center justify-center animate-pulse'>
        <div className='landscape:max-h-sm portrait:max-w-sm landscape:h-[60vh] portrait:w-[60vw] aspect-square opacity-5 animate-spin-slow relative'>
          <Image
            alt='magic_circle'
            fill={true}
            src={`/magic_circle.svg`}
            className='object-contain'
          />
        </div>
      </div>
      <div className='landscape:max-h-sm portrait:max-w-sm landscape:h-[60vh] portrait:w-[60vw] aspect-square relative animate-spin-slow'>
        <div className='animate-anti-spin w-14 h-14 md:w-20 md:h-20 absolute top-0 left-0'>
          <Image
            alt='fire'
            fill={true}
            src={`${process.env.NEXT_PUBLIC_CDN}/sym_3.png`}
            className='object-contain'
          />
        </div>
        <div className='animate-anti-spin w-14 h-14 md:w-20 md:h-20 absolute top-0 right-0'>
          <Image
            alt='wind'
            fill={true}
            src={`${process.env.NEXT_PUBLIC_CDN}/sym_4.png`}
            className='object-contain'
          />
        </div>

        <div className='animate-anti-spin w-14 h-14 md:w-20 md:h-20 absolute bottom-0 left-0'>
          <Image
            alt='water'
            fill={true}
            src={`${process.env.NEXT_PUBLIC_CDN}/sym_5.png`}
            className='object-contain'
          />
        </div>

        <div className='animate-anti-spin w-14 h-14 md:w-20 md:h-20 absolute bottom-0 right-0'>
          <Image
            alt='earth'
            fill={true}
            src={`${process.env.NEXT_PUBLIC_CDN}/sym_6.png`}
            className='object-contain'
          />
        </div>
      </div>
      <p className='text-center sm:text-lg xl:text-xl absolute inset-0 flex flex-col items-center justify-center'>
        {children ?? 'Loading'}
      </p>
    </Transition>
  )
}
