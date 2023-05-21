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
        'm-3 p-1 backdrop-grayscale shadow-md w-full rounded border border-neutral-400/10',
        className,
      )}
    >
      {title && (
        <h3
          className={classNames(
            'uppercase text-sm text-neutral-200 mb-1 font-bold',
            'flex items-center justify-center tracking-widest',
          )}
        >
          <div className='pointer-events-none flex-auto border-t border-amber-400/25 ml-10' />
          <div className='pointer-events-none flex-none h-2 w-2 border-b border-l border-amber-400/25 rotate-45' />
          <div className='pointer-events-none flex-none h-3 w-3 border-b-2 border-l-2 border-amber-400/50 rotate-45' />
          <div className='pointer-events-none flex-none mx-2'>{title}</div>
          <div className='pointer-events-none flex-none h-3 w-3 border-t-2 border-r-2 border-amber-400/50 rotate-45' />
          <div className='pointer-events-none flex-none h-2 w-2 border-t border-r border-amber-400/25 rotate-45' />
          <div className='pointer-events-none flex-auto border-t border-amber-400/25 mr-10' />
        </h3>
      )}
      <div
        className={classNames(
          'border border-amber-400/20 bg-black/50 shadow-md relative',
        )}
      >
        {children}
        <div className='absolute h-2 w-2 -top-px -left-px border-t-2 border-l-2 border-amber-400/50 pointer-events-none' />
        <div className='absolute h-2 w-2 -top-px -right-px border-t-2 border-r-2 border-amber-400/50 pointer-events-none' />
        <div className='absolute h-2 w-2 -bottom-px -left-px border-b-2 border-l-2 border-amber-400/50 pointer-events-none' />
        <div className='absolute h-2 w-2 -bottom-px -right-px border-b-2 border-r-2 border-amber-400/50 pointer-events-none' />
      </div>
    </div>
  )
}
