'use client'

import classNames from 'classnames'
import { ReactNode } from 'react'
import Image from 'next/image'

import AnimatedCounter from './AnimatedCounter'

interface StatCounterProps {
  img: string
  value: number
  children?: ReactNode
  className?: string
}

export default function StatCounter({
  img,
  value,
  children,
  className,
}: StatCounterProps) {
  return (
    <div
      className={classNames(
        'font-mono',
        'relative flex items-center md:gap-1',
        children && 'w-full',
      )}
    >
      <div className='relative w-4 h-4 lg:w-6 lg:h-6 2xl:w-8 2xl:h-8 opacity-30'>
        <Image alt={img} src={img} fill={true} className={'object-contain'} />
      </div>
      {children && (
        <span
          className={classNames(
            'hidden mx-1 md:mx-0 landscape:md:flex opacity-30 font-sans',
          )}
        >
          {children}
        </span>
      )}
      <AnimatedCounter
        value={value}
        className={classNames('text-right font-bold ml-auto', className)}
      />
    </div>
  )
}
