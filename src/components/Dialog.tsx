'use client'

import { Dialog as UiDialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import Panel, { PanelProps } from './Panel'
import Center from './Center'

export interface DialogProps extends PanelProps {
  show: boolean
  onClose?: () => void
}

export default function Dialog({ show, onClose, ...props }: DialogProps) {
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
          <div className='fixed inset-0'>
            <Center>
              <Panel {...props} asDialog onClose={onClose} />
            </Center>
          </div>
        </Transition.Child>
      </UiDialog>
    </Transition>
  )
}
