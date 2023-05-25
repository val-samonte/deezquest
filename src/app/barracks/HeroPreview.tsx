import { selectedNftAtom } from '@/atoms/barracksAtoms'
import AttributesDisplay from '@/components/AttributesDisplay'
import BackIcon from '@/components/BackIcon'
import { HeroSkillDisplay } from '@/components/HeroSkillDisplay'
import Panel from '@/components/Panel'
import SpinnerIcon from '@/components/SpinnerIcon'
import { SkillTypes } from '@/enums/SkillTypes'
import { heroFromPublicKey } from '@/game/gameFunctions'
import { innateSkills } from '@/utils/innateSkills'
import { PublicKey } from '@solana/web3.js'
import classNames from 'classnames'
import { useAtomValue } from 'jotai'
import { IM_Fell_DW_Pica } from 'next/font/google'
import Image from 'next/image'
import { useMemo } from 'react'

const font = IM_Fell_DW_Pica({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

const mask =
  'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 97.5%, rgba(0,0,0,0) 100%)'

export default function HeroPreview() {
  const selected = useAtomValue(selectedNftAtom)

  const hero = useMemo(() => {
    if (!selected?.address) return null
    return heroFromPublicKey(selected.address)
  }, [selected])

  const skills = useMemo(() => {
    if (!hero) return null
    return {
      [SkillTypes.ATTACK]: innateSkills[hero.offensiveSkill],
      [SkillTypes.SUPPORT]: innateSkills[hero.supportiveSkill],
      [SkillTypes.SPECIAL]: innateSkills[hero.specialSkill],
    }
  }, [hero])

  if (!selected || !hero) return null

  return (
    <div className='h-full flex flex-col relative pointer-events-auto'>
      <div
        className='h-full overflow-y-scroll overflow-x-hidden absolute inset-0 p-5'
        style={{
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      >
        <div className='w-full aspect-square'>
          <Panel className='bg-amber-400/20 rounded-b-none'>
            {selected.metadata?.image ? (
              <img
                alt={selected.metadata.name ?? 'Unknown'}
                src={selected.metadata.image}
                className='object-cover w-full aspect-square'
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center'>
                <SpinnerIcon />
              </div>
            )}
          </Panel>
        </div>

        <button type='button' className='sticky -top-5 z-10 w-full'>
          <h2 className='text-left pl-5 py-2 transition-colors bg-black/80 hover:bg-amber-400/20 backdrop-grayscale flex items-center justify-between w-full'>
            <div
              className={classNames(
                'text-2xl overflow-hidden w-48 whitespace-nowrap overflow-ellipsis',
                font.className,
              )}
            >
              {selected.metadata.name}
            </div>

            <div className='flex-none font-bold text-sm tracking-widest uppercase flex items-center '>
              Loadout
              <BackIcon className='rotate-180 text-amber-400/50' />
            </div>
          </h2>
          <div className='h-1 w-full mb-2 bg-gradient-to-r from-amber-400/50 to-amber-400/0' />
        </button>

        <AttributesDisplay hero={hero} />

        {skills && (
          <div className='flex flex-col gap-3 mt-5'>
            <HeroSkillDisplay skill={skills[SkillTypes.ATTACK]}>
              <div className='pl-2 flex justify-between text-neutral-400 pr-5'>
                <span>Unarmed</span>
                <span>0</span>
              </div>
            </HeroSkillDisplay>
            <HeroSkillDisplay skill={skills[SkillTypes.SUPPORT]}>
              <div className='pl-2 flex justify-between text-neutral-400 pr-5'>
                <span>No Armor</span>
                <span>0</span>
              </div>
            </HeroSkillDisplay>
            <HeroSkillDisplay skill={skills[SkillTypes.SPECIAL]}>
              <div className='pl-2 flex justify-between text-neutral-400 pr-5'>
                <span>No Accessory</span>
                <span>0</span>
              </div>
            </HeroSkillDisplay>
          </div>
        )}
      </div>
    </div>
  )
}
