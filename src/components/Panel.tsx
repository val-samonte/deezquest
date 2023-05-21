import classNames from 'classnames'
import { ReactNode } from 'react'

export interface PanelProps {
  title?: string
  className?: string
  children: ReactNode
}

export default function Panel({ children, className, title }: PanelProps) {
  return (
    <div
      className={classNames(
        'm-3 p-2 backdrop-grayscale backdrop-brightness-50 shadow w-full ',
        className,
      )}
    >
      {title && (
        <h3
          className={classNames(
            'uppercase text-sm text-neutral-300 mb-2',
            'flex items-center justify-center tracking-widest',
          )}
        >
          <div className='flex-auto border-t border-amber-400/25 ml-10' />
          <div className='flex-none h-2 w-2 border-b border-l border-amber-400/25 rotate-45' />
          <div className='flex-none h-3 w-3 border-b border-l border-amber-400/25 rotate-45' />
          <div className='flex-none mx-2'>{title}</div>
          <div className='flex-none h-3 w-3 border-t border-r border-amber-400/25 rotate-45' />
          <div className='flex-none h-2 w-2 border-t border-r border-amber-400/25 rotate-45' />
          <div className='flex-auto border-t border-amber-400/25 mr-10' />
        </h3>
      )}
      <div
        className={classNames(
          'border border-amber-400/20 bg-black/50 shadow-md',
        )}
      >
        {children}
      </div>
    </div>
  )
}
