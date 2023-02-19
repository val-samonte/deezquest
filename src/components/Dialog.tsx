'use client'

import { Dialog as UiDialog, Transition } from '@headlessui/react'
import classNames from 'classnames'
import { Fragment, ReactNode } from 'react'

interface DialogProps {
  show: boolean
  title: ReactNode | string
  children: ReactNode
  className?: string
  onClose?: () => void
}

export function Dialog({
  show,
  title,
  children,
  className,
  onClose,
}: DialogProps) {
  return (
    <Transition show={show} as={Fragment}>
      <UiDialog onClose={onClose ?? (() => {})} className='relative z-50'>
        <div
          className='fixed h-screen inset-0 bg-black/75'
          aria-hidden='true'
        />
        <div className='fixed inset-0 flex items-center justify-center'>
          <div className='m-auto w-full max-h-full p-5 overflow-auto'>
            <UiDialog.Panel
              className={classNames(
                'w-full mx-auto max-w-sm overflow-hidden shadow-md drop-shadow-xl',
                className,
              )}
            >
              <UiDialog.Title className='bg-stone-800'>
                <div className='text-lg sm:text-xl lg:text-2xl px-5 py-4 gradient-1'>
                  {title}
                </div>
              </UiDialog.Title>
              <div className='bg-stone-900 h-full min-h-[280px] text-stone-300 w-full py-5 flex flex-col overflow-auto'>
                {children}
              </div>
            </UiDialog.Panel>
          </div>
        </div>
      </UiDialog>
    </Transition>
  )
}
