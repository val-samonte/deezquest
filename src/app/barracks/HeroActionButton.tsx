'use client'

import { Dialog, Transition } from '@headlessui/react'
import { JsonMetadata, Metadata, Nft } from '@metaplex-foundation/js'
import classNames from 'classnames'
import { useAtomValue } from 'jotai'
import { usePathname } from 'next/navigation'
import { Fragment, useMemo, useState } from 'react'
import BotMatchDialog from './BotDialogMatch'
import FriendlyMatchDialog from './FriendlyMatchDialog'
import { userNftCollectionAtom } from './HeroContentPage'
import RankedMatch from './RankedMatch'
import SpecialDialogMatch from './SpecialDialogMatch'

export default function HeroActionButtons() {
  const pathname = usePathname()
  const collection = useAtomValue(userNftCollectionAtom)
  const [showMatchOptions, setShowMatchOptions] = useState(false)
  const isNftOwner = useMemo(() => {
    if (!pathname) return false
    return !!collection.find((nft) => {
      let address
      if (nft.model === 'metadata') {
        address = (nft as Metadata<JsonMetadata<string>>).mintAddress.toBase58()
      } else {
        address = (nft as Nft).mint.address.toBase58()
      }
      return pathname.includes(address)
    })
  }, [pathname, collection])

  const [showRankedDialog, setShowRankedDialog] = useState(false)
  const [showFriendlyDialog, setShowFriendlyDialog] = useState(false)
  const [showBotDialog, setShowBotDialog] = useState(false)
  const [showBunniezDialog, setShowBunniezDialog] = useState(false)

  return (
    <>
      {/* TODO: check if NFT is registered */}
      {isNftOwner && (
        <button
          type='button'
          className={classNames(
            'flex-auto px-3 py-2',
            'flex items-center justify-center',
            'bg-red-700 hover:bg-red-600 rounded',
          )}
          onClick={() => setShowMatchOptions(true)}
        >
          <img src='/BattleIcon.svg' className='w-6 h-6' />
          <span className='ml-2 font-bold uppercase'>Battle</span>
        </button>
      )}
      {/* TODO: Possibly move these as routes */}
      <Transition show={showMatchOptions} as={Fragment}>
        <Dialog
          onClose={() => setShowMatchOptions(false)}
          className='relative z-50'
        >
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
              <div className='m-auto w-full max-h-full p-5 portrait:px-10 overflow-auto'>
                <Dialog.Panel className={'w-full max-w-4xl mx-auto'}>
                  <Dialog.Title
                    className={'flex items-center justify-center mb-5'}
                  >
                    <img src='/BattleIcon.svg' className='w-8 h-8' />
                    <span className='ml-2 text-2xl font-bold'>Battle</span>
                  </Dialog.Title>
                  <ul className='grid grid-cols-1 landscape:grid-cols-4 gap-5'>
                    <li>
                      <button
                        type='button'
                        className={classNames(
                          'portrait:text-left portrait:w-full',
                          'landscape:items-center landscape:justify-center',
                          'bg-gradient-to-tr from-neutral-900 via-neutral-900 to-neutral-900 hover:to-purple-600',
                          'p-3 landscape:p-5 flex landscape:flex-col gap-3 rounded h-full',
                        )}
                        onClick={() => {
                          setShowRankedDialog(true)
                          setShowFriendlyDialog(false)
                          setShowBotDialog(false)
                          setShowBunniezDialog(false)
                        }}
                      >
                        <img
                          src='/match_ranked.svg'
                          className='flex-none landscape:w-full portrait:h-14 aspect-square object-contain'
                        />
                        <div className='flex flex-col landscape:gap-2'>
                          <h3 className='text-lg font-bold'>Ranked Game</h3>
                          <p className='text-sm text-neutral-300'>
                            Be the best adventurer and earn rewards
                          </p>
                        </div>
                      </button>
                    </li>
                    <li>
                      <button
                        type='button'
                        className={classNames(
                          'portrait:text-left portrait:w-full',
                          'landscape:items-center landscape:justify-center',
                          'bg-gradient-to-tr from-neutral-900 via-neutral-900 to-neutral-900 hover:to-purple-600',
                          'p-3 landscape:p-5 flex landscape:flex-col gap-3 rounded h-full',
                        )}
                        onClick={() => {
                          setShowRankedDialog(false)
                          setShowFriendlyDialog(true)
                          setShowBotDialog(false)
                          setShowBunniezDialog(false)
                        }}
                      >
                        <img
                          src='/match_practice.svg'
                          className='flex-none landscape:w-full portrait:h-14 aspect-square object-contain'
                        />
                        <div className='flex flex-col landscape:gap-2'>
                          <h3 className='text-lg font-bold'>Friendly Match</h3>
                          <p className='text-sm text-neutral-300'>
                            Play against your friend off-chain
                          </p>
                        </div>
                      </button>
                    </li>
                    <li>
                      <button
                        type='button'
                        className={classNames(
                          'portrait:text-left portrait:w-full',
                          'landscape:items-center landscape:justify-center',
                          'bg-gradient-to-tr from-neutral-900 via-neutral-900 to-neutral-900 hover:to-purple-600',
                          'p-3 landscape:p-5 flex landscape:flex-col gap-3 rounded h-full',
                        )}
                        onClick={() => {
                          setShowRankedDialog(false)
                          setShowFriendlyDialog(false)
                          setShowBotDialog(true)
                          setShowBunniezDialog(false)
                        }}
                      >
                        <img
                          src='/match_bot.svg'
                          className='flex-none landscape:w-full portrait:h-14 aspect-square object-contain'
                        />
                        <div className='flex flex-col landscape:gap-2'>
                          <h3 className='text-lg font-bold'>Practice</h3>
                          <p className='text-sm text-neutral-300'>
                            Play against a bot off-chain
                          </p>
                        </div>
                      </button>
                    </li>

                    <li>
                      <button
                        type='button'
                        className={classNames(
                          'portrait:text-left portrait:w-full',
                          'landscape:items-center landscape:justify-center',
                          'bg-gradient-to-tr from-neutral-900 via-neutral-900 to-neutral-900 hover:to-purple-600',
                          'p-3 landscape:p-5 flex landscape:flex-col gap-3 rounded h-full',
                        )}
                        onClick={() => {
                          setShowRankedDialog(false)
                          setShowFriendlyDialog(false)
                          setShowBotDialog(false)
                          setShowBunniezDialog(true)
                        }}
                      >
                        <img
                          src='/evil_bunniez1.jpg'
                          className='flex-none landscape:w-full portrait:h-14 aspect-square object-contain'
                          style={{ transform: 'scaleX(-1)' }}
                        />
                        <div className='flex flex-col landscape:gap-2'>
                          <h3 className='text-lg font-bold text-purple-500'>
                            DARK BUNNIEZ
                          </h3>
                          <p className='text-sm text-neutral-300'>
                            A BUNNiEZ event
                          </p>
                        </div>
                      </button>
                    </li>
                  </ul>
                  <div className='flex items-center justify-center my-5'>
                    <button
                      type='button'
                      className={classNames(
                        'px-3 py-2 bg-neutral-700 hover:bg-neutral-600 rounded flex items-center',
                      )}
                      onClick={() => setShowMatchOptions(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>

      <RankedMatch
        show={showRankedDialog}
        onClose={() => setShowRankedDialog(false)}
      />

      <FriendlyMatchDialog
        show={showFriendlyDialog}
        onClose={() => {
          setShowFriendlyDialog(false)
        }}
      />

      <BotMatchDialog
        show={showBotDialog}
        onClose={() => setShowBotDialog(false)}
      />

      <SpecialDialogMatch
        show={showBunniezDialog}
        onClose={() => setShowBunniezDialog(false)}
      />
    </>
  )
}
