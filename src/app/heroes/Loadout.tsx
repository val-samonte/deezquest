import {
  barracksPathFlagsAtom,
  selectedHeroSkillsAtom,
} from '@/atoms/barracksAtoms'
import Center from '@/components/Center'
import CornerDecors from '@/components/CornerDecors'
import { HeroSkillDisplay } from '@/components/HeroSkillDisplay'
import Panel from '@/components/Panel'
import { SkillTypes } from '@/enums/SkillTypes'
import { Transition } from '@headlessui/react'
import classNames from 'classnames'
import { useAtomValue } from 'jotai'
import Image from 'next/image'
import Link from 'next/link'
import { useSelectedLayoutSegments } from 'next/navigation'
import { Fragment, useMemo } from 'react'

export default function Loadout() {
  const segments = useSelectedLayoutSegments()
  const path = useMemo(() => `/heroes/${segments[0]}`, [segments])
  const { level3, loadout, weapon, armor, accessory, items } = useAtomValue(
    barracksPathFlagsAtom,
  )
  const skills = useAtomValue(selectedHeroSkillsAtom)

  return (
    <Transition
      show={loadout}
      className='flex-auto relative py-5 pr-5 flex gap-5'
    >
      <div className='flex-auto flex flex-col gap-5 pointer-events-auto'>
        <div className='flex-auto flex items-stretch relative'>
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
            as={Fragment}
            enter='ease-out duration-300 delay-500'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-out duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='flex-auto -mx-10 relative'>
              <Transition
                show={weapon}
                enter='ease-out duration-300'
                enterFrom='opacity-0 -translate-y-10'
                enterTo='opacity-100 translate-y-0'
                leave='ease-out duration-200 delay-100'
                leaveFrom='opacity-100 translate-y-0'
                leaveTo='opacity-0 translate-y-10'
                className='absolute inset-0 flex flex-wrap justify-center items-start p-5 gap-3 xl:gap-5'
              >
                <div className='w-60 aspect-[3/4] pointer-events-none'>
                  <Panel
                    title='Unarmed'
                    className={classNames(
                      'transition-all duration-300',
                      level3 ? 'bg-indigo-700/50' : 'bg-black/50',
                      'w-60 aspect-[3/4] ',
                    )}
                  >
                    <div className='w-full aspect-square border-b border-amber-400/20 relative'>
                      <Image
                        fill={true}
                        alt='Unarmed'
                        src={`${process.env.NEXT_PUBLIC_CDN}/unarmed.png`}
                        className='brightness-50'
                      />
                    </div>
                    {skills && (
                      <HeroSkillDisplay
                        skill={skills[SkillTypes.ATTACK]}
                        size='sm'
                      />
                    )}
                  </Panel>
                </div>
              </Transition>
              <Transition
                show={armor}
                enter='ease-out duration-300'
                enterFrom='opacity-0 -translate-y-10'
                enterTo='opacity-100 translate-y-0'
                leave='ease-out duration-200 delay-100'
                leaveFrom='opacity-100 translate-y-0'
                leaveTo='opacity-0 translate-y-10'
                className='absolute inset-0 flex flex-wrap justify-center items-start p-5 gap-3 xl:gap-5'
              >
                <div className='w-60 aspect-[3/4] pointer-events-none'>
                  <Panel
                    title='No Armor'
                    className={classNames(
                      'transition-all duration-300',
                      level3 ? 'bg-indigo-700/50' : 'bg-black/50',
                      'w-60 aspect-[3/4] ',
                    )}
                  >
                    <div className='w-full aspect-square border-b border-amber-400/20 relative'>
                      <Image
                        fill={true}
                        alt='Unarmed'
                        src={`${process.env.NEXT_PUBLIC_CDN}/unarmed.png`}
                        className='brightness-50'
                      />
                    </div>
                    {skills && (
                      <HeroSkillDisplay
                        skill={skills[SkillTypes.SUPPORT]}
                        size='sm'
                      />
                    )}
                  </Panel>
                </div>
              </Transition>
              <Transition
                show={accessory}
                enter='ease-out duration-300'
                enterFrom='opacity-0 -translate-y-10'
                enterTo='opacity-100 translate-y-0'
                leave='ease-out duration-200 delay-100'
                leaveFrom='opacity-100 translate-y-0'
                leaveTo='opacity-0 translate-y-10'
                className='absolute inset-0 flex flex-wrap justify-center items-start p-5 gap-3 xl:gap-5'
              >
                <div className='w-60 aspect-[3/4] pointer-events-none'>
                  <Panel
                    title='No Accessory'
                    className={classNames(
                      'transition-all duration-300',
                      level3 ? 'bg-indigo-700/50' : 'bg-black/50',
                      'w-60 aspect-[3/4] ',
                    )}
                  >
                    <div className='w-full aspect-square border-b border-amber-400/20 relative'>
                      <Image
                        fill={true}
                        alt='Unarmed'
                        src={`${process.env.NEXT_PUBLIC_CDN}/unarmed.png`}
                        className='brightness-50'
                      />
                    </div>
                    {skills && (
                      <HeroSkillDisplay
                        skill={skills[SkillTypes.SPECIAL]}
                        size='sm'
                      />
                    )}
                  </Panel>
                </div>
              </Transition>
              <Transition
                show={items}
                enter='ease-out duration-300'
                enterFrom='opacity-0 -translate-y-10'
                enterTo='opacity-100 translate-y-0'
                leave='ease-out duration-200 delay-100'
                leaveFrom='opacity-100 translate-y-0'
                leaveTo='opacity-0 translate-y-10'
                className='absolute inset-0'
              >
                <Center>
                  <Panel title='Notice' className='max-w-xs w-full'>
                    <div className='overflow-auto h-full relative'>
                      <p className='px-5 my-5 text-center'>
                        You do not have any consumables
                      </p>
                    </div>
                  </Panel>
                </Center>
              </Transition>
            </div>
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
              'flex items-center justify-center py-2',
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
      <Transition.Child
        as={Fragment}
        enter='ease-out duration-300 delay-500'
        enterFrom='opacity-0'
        enterTo='opacity-100'
        leave='ease-out duration-200'
        leaveFrom='opacity-100'
        leaveTo='opacity-0'
      >
        <div className='w-96'>
          <Panel title='Weapon Details'>
            <></>
          </Panel>
        </div>
      </Transition.Child>
    </Transition>
  )
}
