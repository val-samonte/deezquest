import {
  barracksPathFlagsAtom,
  selectedHeroSkillsAtom,
} from '@/atoms/barracksAtoms'
import CommandLevelsDescription from '@/components/CommandLevelsDescription'
import { HeroSkillDisplay } from '@/components/HeroSkillDisplay'
import Panel from '@/components/Panel'
import { SkillTypes } from '@/enums/SkillTypes'
import classNames from 'classnames'
import { useAtomValue } from 'jotai'
import { IM_Fell_DW_Pica } from 'next/font/google'
import Image from 'next/image'

const font = IM_Fell_DW_Pica({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

const mask =
  'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 97.5%, rgba(0,0,0,0) 100%)'

export default function LoadoutItemDetails() {
  const { weapon, armor } = useAtomValue(barracksPathFlagsAtom)
  const skills = useAtomValue(selectedHeroSkillsAtom)
  const selectedSkill = weapon
    ? skills?.[SkillTypes.ATTACK]
    : armor
    ? skills?.[SkillTypes.SUPPORT]
    : skills?.[SkillTypes.SPECIAL]

  return (
    <div
      className={classNames(
        'flex-auto pointer-events-auto relative mx-auto w-96 p-5 h-full overflow-y-scroll overflow-x-hidden',
      )}
      style={{
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    >
      <div className='w-full aspect-square landscape:hidden landscape:lg:block'>
        <Panel className='bg-amber-400/20 rounded-b-none w-full relative '>
          <Image
            fill={true}
            alt='Unarmed'
            src={`${process.env.NEXT_PUBLIC_CDN}/unarmed.png`}
            className='brightness-50 object-cover'
          />
        </Panel>
      </div>
      <div className='ltr sticky -top-5 z-10 w-full'>
        <h2 className='text-left px-5 py-2 transition-colors bg-black backdrop-grayscale flex items-center justify-between w-full'>
          <div
            className={classNames(
              'text-2xl overflow-hidden w-48 whitespace-nowrap overflow-ellipsis',
              font.className,
            )}
          >
            {weapon ? 'Unarmed' : armor ? 'No Armor' : 'No Accessory'}
          </div>
        </h2>
        <div className='h-1 w-full mb-2 bg-gradient-to-r from-amber-400/50 to-amber-400/0' />
      </div>
      {selectedSkill && (
        <div className='flex flex-col gap-3'>
          <HeroSkillDisplay skill={selectedSkill} className='w-full'>
            <div className='h-5' />
          </HeroSkillDisplay>
          <p className='px-5 text-sm text-neutral-400'>{selectedSkill.desc}</p>
          <CommandLevelsDescription skill={selectedSkill} />
        </div>
      )}
    </div>
  )
}
