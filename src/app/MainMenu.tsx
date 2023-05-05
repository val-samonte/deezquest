'use client'

import { useUserWallet } from '@/atoms/userWalletAtom'
import BackIcon from '@/components/BackIcon'
import { trimAddress } from '@/utils/trimAddress'
import { Dialog, Transition } from '@headlessui/react'
import { Dialog as UIDialog } from '@/components/Dialog'
import classNames from 'classnames'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Fragment, useState } from 'react'
import dynamic from 'next/dynamic'
import { matchAtom } from '@/atoms/matchAtom'
import { gameResultAtom, gameStateAtom } from '@/atoms/gameStateAtom'
import { peerAtom } from '@/atoms/peerConnectionAtom'
import { PeerMessages } from '@/enums/PeerMessages'
import { MatchTypes } from '@/enums/MatchTypes'
import { isXNftAtom } from '@/atoms/isXNftAtom'

export const showMenuAtom = atom(false)
const PeerConnectionIndicator = dynamic(() => import('@/atoms/peerAtom'), {
  ssr: false,
})

export default function MainMenu() {
  const router = useRouter()
  const wallet = useUserWallet()
  const pathname = usePathname()
  const peerInstance = useAtomValue(peerAtom)
  const isXNft = useAtomValue(isXNftAtom)
  const [open, setOpen] = useAtom(showMenuAtom)
  const [match, setMatch] = useAtom(matchAtom)
  const setGameState = useSetAtom(gameStateAtom)
  const setGameResult = useSetAtom(gameResultAtom)
  const [quitMatchConfirm, setQuitMatchConfirm] = useState(false)

  return (
    <>
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
                    {wallet?.connected && (
                      <li className='flex items-center justify-between text-base py-5'>
                        <span className='flex items-center gap-2'>
                          {!isXNft && (
                            <span className='hidden sm:inline-block'>
                              Connected as:
                            </span>
                          )}
                          <span className='font-bold'>
                            {trimAddress(wallet.publicKey?.toBase58() ?? '')}
                          </span>
                          <PeerConnectionIndicator />
                        </span>
                        {isXNft ? (
                          <span className='bg-amber-400 text-black font-bold px-4 py-1 rounded-full uppercase text-sm'>
                            Alpha on Devnet
                          </span>
                        ) : (
                          <button
                            type='button'
                            className='underline font-bold'
                            onClick={() => wallet.disconnect()}
                          >
                            Disconnect
                          </button>
                        )}
                      </li>
                    )}
                    {wallet?.connected &&
                      match &&
                      !pathname?.includes('/battle') && (
                        <li
                          className={classNames(
                            ' rounded shadow-sm p-3 px-5',
                            'bg-gradient-to-r from-neutral-900 to-red-600 hover:bg-red-600 transition-colors',
                          )}
                        >
                          <Link
                            href={'/battle'}
                            className='flex items-center gap-3 outline-none'
                            onClick={() => setOpen(false)}
                          >
                            <img src='/BattleIcon.svg' className='w-12 h-12' />
                            Resume Battle
                          </Link>
                        </li>
                      )}
                    {wallet?.connected &&
                      match &&
                      pathname?.includes('/battle') && (
                        <li
                          className={classNames(
                            'shadow-sm rounded',
                            'bg-gradient-to-r from-neutral-900 to-red-600 hover:bg-red-600 transition-colors',
                          )}
                        >
                          <button
                            type='button'
                            className='flex items-center gap-3 outline-none w-full p-3 px-5 rounded'
                            onClick={() => {
                              setOpen(false)
                              setQuitMatchConfirm(true)
                            }}
                          >
                            <img src='/BattleIcon.svg' className='w-12 h-12' />
                            Quit Battle
                          </button>
                        </li>
                      )}
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
                        onClick={() => setOpen(false)}
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
                        onClick={() => setOpen(false)}
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
                        onClick={() => setOpen(false)}
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
                        onClick={() => setOpen(false)}
                      >
                        <img src='/stat_int.svg' className='w-12 h-12' />
                        Tutorial
                      </Link>
                    </li>
                    <li>
                      {!isXNft ? (
                        <ul className='text-base grid grid-cols-4 py-2'>
                          <li className='flex items-center justify-center gap-2 font-bold'>
                            <button
                              type='button'
                              onClick={() => setOpen(false)}
                            >
                              <BackIcon className='flex-none' />
                            </button>
                          </li>
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
                          <li className='flex items-center justify-center gap-3 p-2'>
                            <a
                              href='https://github.com/val-samonte/deezquest'
                              target='_blank'
                              rel='noreferrer'
                            >
                              <img
                                src='/github.svg'
                                className='w-6 h-6'
                                alt='Github'
                              />
                            </a>

                            {/* <span className='hidden md:inline'>Github</span> */}
                          </li>
                        </ul>
                      ) : (
                        <button
                          className='flex items-center justify-center gap-2 font-bold text-base w-full'
                          type='button'
                          onClick={() => setOpen(false)}
                        >
                          <BackIcon className='flex-none' />
                          Back
                        </button>
                      )}
                    </li>
                  </ul>
                </Dialog.Panel>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
      <UIDialog
        show={quitMatchConfirm}
        title='Quit Battle'
        className='max-w-sm'
        onClose={() => setQuitMatchConfirm(false)}
      >
        <p className='px-5 mb-5 text-center'>
          Are you sure you want to quit this match?
        </p>
        <div className='flex-auto' />
        <div className='flex gap-3 px-5'>
          <button
            type='button'
            className={classNames(
              'px-3 py-2 bg-neutral-700 hover:bg-neutral-600 rounded flex items-center',
            )}
            onClick={() => setQuitMatchConfirm(false)}
          >
            Cancel
          </button>
          <button
            type='button'
            className={classNames(
              'flex items-center justify-center',
              'flex-auto px-3 py-2 bg-red-700 hover:bg-red-600 rounded',
            )}
            onClick={() => {
              setQuitMatchConfirm(false)
              if (
                match?.matchType === MatchTypes.FRIENDLY &&
                match?.opponent.peerId
              ) {
                peerInstance?.sendMessage(match?.opponent.peerId, {
                  type: PeerMessages.QUIT,
                })
              }
              window.sessionStorage.clear()
              setGameState(null)
              setMatch(null)
              setGameResult('')
              router.push('/barracks')
            }}
          >
            Quit Match
          </button>
        </div>
      </UIDialog>
    </>
  )
}
