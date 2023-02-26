'use client'

import classNames from 'classnames'
import { ReactNode } from 'react'
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
        'relative flex items-center md:gap-1',
        children && 'w-full',
      )}
    >
      <img
        src={img}
        className={classNames(
          'w-4 h-4 lg:w-6 lg:h-6 2xl:w-8 2xl:h-8 opacity-30',
        )}
      />
      {children && (
        <span
          className={classNames(
            'hidden mx-1 md:mx-0 landscape:md:flex opacity-30',
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
