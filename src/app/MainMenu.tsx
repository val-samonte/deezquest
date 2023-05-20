'use client'

import classNames from 'classnames'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { usePathname, useRouter } from 'next/navigation'
import { Fragment, useEffect, useState } from 'react'

import { gameResultAtom, gameStateAtom } from '@/atoms/gameStateAtom'
import { isXNftAtom } from '@/atoms/isXNftAtom'
import { matchAtom } from '@/atoms/matchAtom'
import { peerAtom } from '@/atoms/peerConnectionAtom'
import { useUserWallet } from '@/atoms/userWalletAtom'
import { Dialog as UIDialog } from '@/components/Dialog'
import { MatchTypes } from '@/enums/MatchTypes'
import { PeerMessages } from '@/enums/PeerMessages'
import { trimAddress } from '@/utils/trimAddress'
import { Dialog, Transition } from '@headlessui/react'
import { hoveredAtom, showMenuAtom } from '@/atoms/menuAtom'
import BackIcon from '@/components/BackIcon'
import MainMenuItem from './MainMenuItem'

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
  const [actualOpen, setActualOpen] = useState(false)
  const [match, setMatch] = useAtom(matchAtom)
  const setGameState = useSetAtom(gameStateAtom)
  const setGameResult = useSetAtom(gameResultAtom)
  const [quitMatchConfirm, setQuitMatchConfirm] = useState(false)
  const setHoveredItem = useSetAtom(hoveredAtom)

  useEffect(() => {
    setHoveredItem(!pathname || pathname === '/' ? '' : pathname)
  }, [pathname, setHoveredItem])

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keyup', listener)
    return () => {
      window.removeEventListener('keyup', listener)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setActualOpen(open)
  }, [open, match, pathname, setActualOpen])

  return (
    <>
      <Transition show={actualOpen} as={Fragment}>
        <Dialog onClose={() => {}} className='relative z-50'>
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
              className='fixed h-screen inset-0 bg-black/90 backdrop-blur-sm'
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
              <div className='m-auto w-full max-h-full px-3 py-5'>
                <Dialog.Panel className='mx-auto'>
                  {/* MENU ITEM WRAPPER */}
                  <div className='max-w-min mx-auto relative'>
                    <div
                      className='flex portrait:flex-col items-center justify-center landscape:gap-[5vw] portrait:gap-[5vh] -mt-10 portrait:-mt-20'
                      onMouseOut={() =>
                        setHoveredItem(
                          !pathname || pathname === '/' ? '' : pathname,
                        )
                      }
                    >
                      {wallet?.connected && match && (
                        <MainMenuItem
                          alt={
                            pathname?.includes('/battle') ? 'Quit' : 'Resume'
                          }
                          isRed={pathname?.includes('/battle')}
                          name='Battle'
                          link='/battle'
                          bgImg='/bg_arena.png'
                          maskImg='/mask_brush_2.png'
                          onSelect={() => {
                            if (pathname?.includes('/battle')) {
                              setOpen(false)
                              setQuitMatchConfirm(true)
                            } else {
                              setOpen(false)
                              setTimeout(() => {
                                router.push('/battle')
                              }, 500)
                            }
                          }}
                        />
                      )}
                      <MainMenuItem
                        name='Pub'
                        link='/pub'
                        bgImg='/bg_bar.png'
                        maskImg='/mask_brush_1.png'
                      />
                      <MainMenuItem
                        name='Barracks'
                        link='/barracks'
                        bgImg='/bg_barracks.png'
                        maskImg='/mask_brush_2.png'
                      />
                      <MainMenuItem
                        name='Tutorial'
                        link='/tutorial'
                        bgImg='/bg_library.png'
                        maskImg='/mask_brush_1.png'
                      />
                    </div>
                    <div
                      className={classNames(
                        'fixed landscape:xl:absolute z-50',
                        'top-[5vh] left-[5vh]',
                        'landscape:top-[5vw] landscape:left-[5vw]',
                        'landscape:xl:-top-[20vh] landscape:xl:-left-[5vw]',
                      )}
                    >
                      <div className='landscape:h-[15vh] portrait:w-[15vw] aspect-square relative'>
                        <Image
                          alt='DeezQuest Logo'
                          fill={true}
                          className='object-contain'
                          src={`${process.env.NEXT_PUBLIC_CDN}/logo.png`}
                        />
                      </div>
                    </div>
                    <div
                      className={classNames(
                        'fixed landscape:xl:absolute z-50',
                        'bottom-0 right-0 portrait:w-screen',
                        'portrait:sm:bottom-[5vh] portrait:sm:right-[5vh]',
                        'landscape:bottom-[5vw] landscape:right-[5vw]',
                        'landscape:xl:-bottom-[20vh] landscape:xl:-right-[5vw]',
                        'portrait:p-5 sm:max-w-max mx-auto',
                        'landscape:xl:-bottom-[20vh]',
                        'flex flex-col justify-end text-right',
                      )}
                    >
                      {wallet?.connected && (
                        <li className='flex items-center justify-center sm:justify-end text-base py-5 gap-5'>
                          <span className='flex items-center gap-2'>
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
                              onClick={() => {
                                setOpen(false)
                                setTimeout(() => {
                                  wallet.disconnect()
                                  router.push('/')
                                }, 500)
                              }}
                            >
                              Disconnect
                            </button>
                          )}
                        </li>
                      )}
                      {!isXNft ? (
                        <ul className='text-base grid grid-cols-4'>
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
                              <Image
                                src='/twitter.svg'
                                className='w-6 h-6'
                                alt='Twitter'
                                width={248}
                                height={204}
                              />
                            </a>
                          </li>
                          <li className='opacity-20 flex items-center justify-center gap-3'>
                            <Image
                              src='/discord.svg'
                              className='w-6 h-6'
                              alt='Discord'
                              width={71}
                              height={55}
                            />
                          </li>
                          <li className='flex items-center justify-center gap-3 p-2'>
                            <a
                              href='https://github.com/val-samonte/deezquest'
                              target='_blank'
                              rel='noreferrer'
                            >
                              <Image
                                src='/github.svg'
                                className='w-6 h-6'
                                alt='Github'
                                width={98}
                                height={96}
                              />
                            </a>
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
                    </div>
                  </div>
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
