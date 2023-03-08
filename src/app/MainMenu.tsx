'use client'

import { Dialog, Transition } from '@headlessui/react'
import classNames from 'classnames'
import { atom, useAtom } from 'jotai'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'

export const showMenuAtom = atom(false)

export default function MainMenu() {
  const pathname = usePathname()
  const [open, setOpen] = useAtom(showMenuAtom)

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={() => setOpen(false)} className='relative z-50'>
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
            onClick={() => setOpen(false)}
            className='fixed h-screen inset-0 bg-black/80 backdrop-blur-sm'
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
            <div className='m-auto w-full max-h-full px-3 py-5 overflow-auto'>
              <Dialog.Panel className='max-w-xs mx-auto'>
                <div className='flex items-center justify-center'>
                  <img src='/logo.png' className='w-20 h-20 mb-5' />
                </div>
                <ul
                  className={classNames(
                    'text-2xl gap-3',
                    'mx-auto',
                    'flex flex-col',
                  )}
                >
                  <li
                    className={classNames(
                      ' rounded shadow-sm p-3 px-5',
                      pathname?.includes('/barracks')
                        ? 'bg-gradient-to-r from-neutral-900 to-purple-600'
                        : 'bg-neutral-900 hover:bg-purple-600 transition-colors',
                    )}
                  >
                    <Link
                      href={'/barracks'}
                      className='flex items-center gap-3 outline-none'
                    >
                      <img src='/menu_barracks.svg' className='w-12 h-12' />
                      Barracks
                    </Link>
                  </li>
                  <li
                    className={classNames(
                      ' rounded shadow-sm p-3 px-5',
                      pathname?.includes('/inventory')
                        ? 'bg-gradient-to-r from-neutral-900 to-purple-600'
                        : 'bg-neutral-900 hover:bg-purple-600 transition-colors',
                    )}
                  >
                    <Link
                      href={'/inventory'}
                      className='flex items-center gap-3 outline-none'
                    >
                      <img src='/menu_inventory.svg' className='w-12 h-12' />
                      Inventory
                    </Link>
                  </li>
                  <li
                    className={classNames(
                      ' rounded shadow-sm p-3 px-5',
                      pathname?.includes('/shop')
                        ? 'bg-gradient-to-r from-neutral-900 to-purple-600'
                        : 'bg-neutral-900 hover:bg-purple-600 transition-colors',
                    )}
                  >
                    <Link
                      href={'/shop'}
                      className='flex items-center gap-3 outline-none'
                    >
                      <img src='/menu_shop.svg' className='w-12 h-12' />
                      Shop
                    </Link>
                  </li>
                  <li
                    className={classNames(
                      ' rounded shadow-sm p-3 px-5',
                      pathname?.includes('/tutorial')
                        ? 'bg-gradient-to-r from-neutral-900 to-purple-600'
                        : 'bg-neutral-900 hover:bg-purple-600 transition-colors',
                    )}
                  >
                    <Link
                      href={'/tutorial'}
                      className='flex items-center gap-3 outline-none'
                    >
                      <img src='/stat_int.svg' className='w-12 h-12' />
                      Tutorial
                    </Link>
                  </li>
                  <li>
                    <ul className='text-base grid grid-cols-3 py-2'>
                      <li className='flex items-center justify-center gap-3'>
                        <a
                          href='https://twitter.com/deezquest'
                          target='_blank'
                          rel='noreferrer'
                        >
                          <img
                            src='/twitter.svg'
                            className='w-6 h-6'
                            alt='Twitter'
                          />
                        </a>
                        {/* <span className='hidden md:inline'>Twitter</span> */}
                      </li>
                      <li className='opacity-20 flex items-center justify-center gap-3'>
                        <img
                          src='/discord.svg'
                          className='w-6 h-6'
                          alt='Discord'
                        />
                        {/* <span className='hidden md:inline'>Discord</span> */}
                      </li>
                      <li className='opacity-20 flex items-center justify-center gap-3 p-2'>
                        <img
                          src='/github.svg'
                          className='w-6 h-6'
                          alt='Github'
                        />
                        {/* <span className='hidden md:inline'>Github</span> */}
                      </li>
                    </ul>
                  </li>
                </ul>
              </Dialog.Panel>
            </div>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  )
}
