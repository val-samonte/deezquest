'use client'

import { Dialog } from '@headlessui/react'
import classNames from 'classnames'
import { ReactNode, useMemo } from 'react'
import CornerDecors from './CornerDecors'
import CloseIcon from './CloseIcon'

export interface PanelProps {
  title?: string
  className?: string
  subtitle?: string
  asDialog?: boolean
  children?: ReactNode
  onClose?: () => unknown
}

export default function Panel({
  children,
  className,
  title,
  subtitle,
  asDialog,
  onClose,
}: PanelProps) {
  const [PanelComponent, PanelTitleComponent] = useMemo(() => {
    return asDialog ? [Dialog.Panel, Dialog.Title] : ['div', 'h3']
  }, [asDialog])

  return (
    <PanelComponent
      className={classNames(
        'flex flex-col',
        'p-1 shadow-md w-full h-full rounded border border-neutral-400/10',
        className,
      )}
    >
      {title && (
        <PanelTitleComponent
          className={classNames(
            'flex-none relative',
            'uppercase text-sm text-neutral-200 mb-1 font-bold',
            'tracking-widest',
          )}
        >
          <Decor>
            <div className='pointer-events-none flex-none mx-2'>{title}</div>
          </Decor>
          {onClose && (
            <button
              type='button'
              onClick={onClose}
              className='absolute right-0 top-0 h-full aspect-square flex items-center justify-center'
            >
              <CloseIcon className='h-4 w-4' />
            </button>
          )}
        </PanelTitleComponent>
      )}
      <div
        className={classNames(
          'w-full h-[80%] flex-auto border border-amber-400/20 bg-black/50 shadow-md relative',
        )}
      >
        {children}
        <CornerDecors />
      </div>
      {typeof subtitle !== 'undefined' && (
        <div className='flex-none mt-1 py-1 text-xs font-bold w-full'>
          <Decor>{subtitle}</Decor>
        </div>
      )}
    </PanelComponent>
  )
}

function Decor({ children }: { children?: ReactNode }) {
  return (
    <div className='w-full flex items-center justify-center'>
      <div className='pointer-events-none flex-auto border-t border-amber-400/25 ml-[10%]' />
      <div className='pointer-events-none flex-none h-2 w-2 border-b border-l border-amber-400/25 rotate-45' />
      <div className='pointer-events-none flex-none h-3 w-3 border-b-2 border-l-2 border-amber-400/50 rotate-45' />
      {children ? (
        children
      ) : (
        <div className='pointer-events-none flex-none h-2 w-2 border border-amber-400/25 rotate-45' />
      )}
      <div className='pointer-events-none flex-none h-3 w-3 border-t-2 border-r-2 border-amber-400/50 rotate-45' />
      <div className='pointer-events-none flex-none h-2 w-2 border-t border-r border-amber-400/25 rotate-45' />
      <div className='pointer-events-none flex-auto border-t border-amber-400/25 mr-[10%]' />
    </div>
  )
}
