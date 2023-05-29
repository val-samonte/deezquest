import {
  barracksPathFlagsAtom,
  selectedHeroSkillsAtom,
} from '@/atoms/barracksAtoms'
import Center from '@/components/Center'
import { HeroSkillDisplay } from '@/components/HeroSkillDisplay'
import Panel from '@/components/Panel'
import { SkillTypes } from '@/enums/SkillTypes'
import { Transition } from '@headlessui/react'
import classNames from 'classnames'
import { useAtomValue } from 'jotai'
import Image from 'next/image'
import Link from 'next/link'
import { useSelectedLayoutSegments } from 'next/navigation'

const mask =
  'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 97.5%, rgba(0,0,0,0) 100%)'

export default function LoadoutInventory() {
  const segments = useSelectedLayoutSegments()
  const { level3, weapon, armor, accessory, items } = useAtomValue(
    barracksPathFlagsAtom,
  )
  const skills = useAtomValue(selectedHeroSkillsAtom)
  const level2Path = `/heroes/${segments[0]}/${segments[1] ?? ''}`

  return (
    <>
      <Transition
        show={weapon}
        enter='ease-out duration-300'
        enterFrom='opacity-0 -translate-y-10'
        enterTo='opacity-100 translate-y-0'
        leave='ease-out duration-200 delay-100'
        leaveFrom='opacity-100 translate-y-0'
        leaveTo='opacity-0 translate-y-10'
        className='absolute inset-0 flex flex-wrap justify-center items-start p-5 gap-3 xl:gap-5 overflow-y-auto overflow-x-hidden'
        style={{
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      >
        <Link href={`${level2Path}/nothing`}>
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
              <HeroSkillDisplay skill={skills[SkillTypes.ATTACK]} size='sm' />
            )}
          </Panel>
        </Link>
      </Transition>
      <Transition
        show={armor}
        enter='ease-out duration-300'
        enterFrom='opacity-0 -translate-y-10'
        enterTo='opacity-100 translate-y-0'
        leave='ease-out duration-200 delay-100'
        leaveFrom='opacity-100 translate-y-0'
        leaveTo='opacity-0 translate-y-10'
        className='absolute inset-0 flex flex-wrap justify-center items-start p-5 gap-3 xl:gap-5 overflow-y-auto overflow-x-hidden'
        style={{
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      >
        <Link href={`${level2Path}/nothing`}>
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
              <HeroSkillDisplay skill={skills[SkillTypes.SUPPORT]} size='sm' />
            )}
          </Panel>
        </Link>
      </Transition>
      <Transition
        show={accessory}
        enter='ease-out duration-300'
        enterFrom='opacity-0 -translate-y-10'
        enterTo='opacity-100 translate-y-0'
        leave='ease-out duration-200 delay-100'
        leaveFrom='opacity-100 translate-y-0'
        leaveTo='opacity-0 translate-y-10'
        className='absolute inset-0 flex flex-wrap justify-center items-start p-5 gap-3 xl:gap-5 overflow-y-auto overflow-x-hidden'
        style={{
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      >
        <Link href={`${level2Path}/nothing`}>
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
              <HeroSkillDisplay skill={skills[SkillTypes.SPECIAL]} size='sm' />
            )}
          </Panel>
        </Link>
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
    </>
  )
}
