import { barracksPathFlagsAtom } from '@/atoms/barracksAtoms'
import CornerDecors from '@/components/CornerDecors'
import { Transition } from '@headlessui/react'
import classNames from 'classnames'
import { useAtomValue } from 'jotai'
import Link from 'next/link'
import { useSelectedLayoutSegments } from 'next/navigation'
import { Fragment, useCallback, useMemo } from 'react'
import LoadoutItemDetails from './LoadoutItemDetails'
import LoadoutInventory from './LoadoutInventory'
import Button from '@/components/Button'

export default function Loadout() {
  const segments = useSelectedLayoutSegments()
  const path = useMemo(() => `/heroes/${segments[0]}`, [segments])
  const { level3, loadout, weapon, armor, accessory, items } = useAtomValue(
    barracksPathFlagsAtom,
  )

  const level2Path = `/heroes/${segments[0]}/${segments[1] ?? ''}`

  return (
    <Transition
      show={loadout}
      className={classNames(
        'absolute inset-0 md:relative',
        'flex-auto py-5 flex',
      )}
    >
      <div
        className={classNames(
          'transition-all duration-500',
          level3 ? 'blur-sm xl:blur-0' : 'blur-0',
          level3 ? 'pr-5 xl:pr-96' : 'pr-5',
          'flex-auto flex flex-col gap-5 pointer-events-auto',
        )}
      >
        <div
          className={classNames(
            level3 && 'pointer-events-none xl:pointer-events-auto',
            'flex-auto flex items-stretch relative',
          )}
        >
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300 delay-300'
            enterFrom='opacity-0 -translate-x-10'
            enterTo='opacity-100 translate-x-0'
            leave='ease-out duration-200 delay-100'
            leaveFrom='opacity-100 translate-x-0'
            leaveTo='opacity-0 -translate-x-10'
          >
            <div className='flex-none w-10 border-y border-l border-amber-400/50'>
              <CornerDecors className='w-6 h-6' right={false} />
            </div>
          </Transition.Child>
          <Transition.Child
            enter='ease-out duration-300 delay-500'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-out duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
            className={classNames('flex-auto -mx-10 relative')}
          >
            <LoadoutInventory />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300 delay-300'
            enterFrom='opacity-0 translate-x-10'
            enterTo='opacity-100 translate-x-0'
            leave='ease-out duration-200'
            leaveFrom='opacity-100 translate-x-0'
            leaveTo='opacity-0 translate-x-10'
          >
            <div className='flex-none w-10 border-y border-r border-amber-400/50'>
              <CornerDecors className='w-6 h-6' left={false} />
            </div>
          </Transition.Child>
        </div>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0 translate-y-10'
          enterTo='opacity-100 translate-y-0'
          leave='ease-out duration-200'
          leaveFrom='opacity-100 translate-y-0'
          leaveTo='opacity-0 translate-y-10'
        >
          <ul
            className={classNames(
              'hidden xl:flex',
              'items-center justify-center py-2',
              'uppercase tracking-widest font-bold',
            )}
          >
            <li className='h-2 w-2 border-b border-l border-amber-400/50 rotate-45' />
            <li className='h-4 w-4 border-b-2 border-l-2 border-amber-400/50 rotate-45' />
            <li className='mx-1' />
            <li
              className={classNames(
                'transition-all duration-300 cursor-pointer',
                weapon ? 'opacity-100' : 'opacity-20',
              )}
            >
              <Link href={`${path}/weapon`}>Weapon</Link>
            </li>
            <li className='h-2 w-2 border mx-3 border-amber-400/50 rotate-45' />
            <li
              className={classNames(
                'transition-all duration-300 cursor-pointer',
                armor ? 'opacity-100' : 'opacity-20',
              )}
            >
              <Link href={`${path}/armor`}>Armor</Link>
            </li>
            <li className='h-2 w-2 border mx-3 border-amber-400/50 rotate-45' />
            <li
              className={classNames(
                'transition-all duration-300 cursor-pointer',
                accessory ? 'opacity-100' : 'opacity-20',
              )}
            >
              <Link href={`${path}/accessory`}>Accessory</Link>
            </li>
            <li className='h-2 w-2 border mx-3 border-amber-400/50 rotate-45' />
            <li
              className={classNames(
                'transition-all duration-300 cursor-pointer',
                items ? 'opacity-100' : 'opacity-20',
              )}
            >
              <Link href={`${path}/items`}>Items</Link>
            </li>
            <li className='mx-1' />
            <li className='h-4 w-4 border-t-2 border-r-2 border-amber-400/50 rotate-45' />
            <li className='h-2 w-2 border-t border-r border-amber-400/50 rotate-45' />
          </ul>
        </Transition.Child>
      </div>
      {level3 && (
        <Link
          href={level2Path}
          className={classNames(
            'block xl:hidden',
            'cursor-pointer absolute inset-0 pointer-events-auto',
          )}
        />
      )}
      <Transition.Child
        // key={weapon ? 'weapon' : armor ? 'armor' : 'accessory'}
        enter='ease-out duration-500 delay-200'
        enterFrom='opacity-0'
        enterTo='opacity-100'
        leave='ease-out duration-200'
        leaveFrom='opacity-100'
        leaveTo='opacity-0'
        className={classNames(
          'transition-all duration-500',
          !level3 ? '-mr-96' : 'mr-0',
          'absolute inset-y-0 right-0 py-5',
          'bg-black/80 xl:bg-black/0',
        )}
      >
        <LoadoutItemDetails />

        {/* <div
          className={classNames(
            'w-full pointer-events-auto p-5 overflow-y-scroll',
          )}
        >
          <div className='ltr gap-1 grid grid-cols-4'>
            <button
              type='button'
              // onClick={() =>
              //   router.push(segments.slice(0, level3 ? -2 : -1).join('/'))
              // }
              className={classNames(
                // !level2 && 'landscape:hidden portrait:sm:hidden',
                'w-full col-span-1 flex gap-1 items-center justify-start text-sm tracking-widest uppercase',
              )}
            >
              
              Close
            </button>
            <div
              className={classNames(
                'flex items-center',
                // !level2 && 'landscape:col-span-4 portrait:sm:col-span-4',
                'w-full col-span-3',
              )}
            >
              <div
                className={classNames(
                  // level2 && 'hidden',
                  'h-6 w-6 border border-amber-400/50 rotate-45',
                )}
              />
              <Button
                // onClick={() =>
                //   router.push(segments.slice(0, 3).join('/') + '/mission')
                // }
                className={classNames(
                  // mission && 'hidden',
                  'overflow-hidden px-0',
                  'flex-auto transition-all',
                  'flex items-center justify-center gap-1',
                )}
              >
                
                Unequip
              </Button>
            </div>
          </div>
        </div> */}
      </Transition.Child>
    </Transition>
  )
}
