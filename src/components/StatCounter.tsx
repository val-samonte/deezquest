'use client'

import classNames from 'classnames'
import { ReactNode } from 'react'

interface StatCounterProps {
  img: string
  value: number
  children?: ReactNode
}

export default function StatCounter({
  img,
  value,
  children,
}: StatCounterProps) {
  return (
    <div className='flex items-center gap-1'>
      <img src={img} className={classNames('w-4 h-4')} />
      {children && <span className={classNames('hidden')}>{children}</span>}
      <span className='text-right font-bold'>{value}</span>
    </div>
  )
}
