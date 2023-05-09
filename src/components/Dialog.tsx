'use client'

import classNames from 'classnames'
import CloseIcon from './CloseIcon'
import { Dialog as UiDialog, Transition } from '@headlessui/react'
import { ReactNode, Fragment } from 'react'

interface DialogProps {
  show: boolean
  title?: ReactNode | string
  children: ReactNode
  className?: string
  padVertical?: boolean
  onClose?: () => void
}

export function Dialog({
  show,
  title,
  children,
  className,
  padVertical,
  onClose,
}: DialogProps) {
  return (
    <Transition show={show} as={Fragment}>
      <UiDialog onClose={onClose ?? (() => {})} className='relative z-50'>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div
            className='fixed h-screen inset-0 bg-black/80'
            aria-hidden='true'
          />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0 scale-95'
          enterTo='opacity-100 scale-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100 scale-100'
          leaveTo='opacity-0 scale-95'
        >
          <div className='fixed inset-0 flex items-center justify-center'>
            <div className='m-auto w-full max-h-full p-5 overflow-auto'>
              <UiDialog.Panel
                className={classNames(
                  'w-full mx-auto overflow-hidden shadow-md drop-shadow-xl rounded',
                  className,
                )}
              >
                {title && (
                  <UiDialog.Title className='bg-neutral-800 border-b border-b-black/50 flex justify-between items-center px-5 py-4'>
                    <div className='text-lg gradient-1'>{title}</div>
                    <button type='button' onClick={onClose}>
                      <CloseIcon />
                    </button>
                  </UiDialog.Title>
                )}
                <div
                  className={classNames(
                    padVertical !== false && 'py-5',
                    'bg-neutral-900 h-full min-h-[280px] text-stone-300 w-full flex flex-col overflow-auto',
                  )}
                >
                  {children}
                </div>
              </UiDialog.Panel>
            </div>
          </div>
        </Transition.Child>
      </UiDialog>
    </Transition>
  )
}
