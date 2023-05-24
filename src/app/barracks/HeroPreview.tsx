import { selectedNftAtom } from '@/atoms/barracksAtoms'
import AttributesDisplay from '@/components/AttributesDisplay'
import BackIcon from '@/components/BackIcon'
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
        className='h-full overflow-y-auto overflow-x-hidden absolute inset-0 p-5'
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

        <div className='flex flex-col gap-3 mt-5'>
          <div className='flex h-16 items-center relative pl-6'>
            <div className='flex justify-center w-10 flex-none'>
              <div className='h-14 aspect-square relative'>
                <Image
                  fill={true}
                  alt='Offensive Skill'
                  src='/cmd_attack.svg'
                  className='object-contain'
                />
              </div>
            </div>
            <div className='h-14 w-14 aspect-square absolute left-4 -rotate-45'>
              <div className='h-4 w-4 aspect-square border-l-2 border-t-2 border-amber-400/50 absolute top-0 left-0' />
              <div className='h-4 w-4 aspect-square border-r-2 border-b-2 border-amber-400/50 absolute bottom-0 right-0' />
              <div className='h-4 w-4 aspect-square border-r border-b border-amber-400/50 absolute -bottom-1 -right-1' />
            </div>
            <div className='flex-auto flex flex-col pl-6 gap-1 text-sm'>
              <div className='pl-2 flex justify-between text-white uppercase tracking-widest pr-5'>
                <span>Crushing Blow</span>
                <span>A</span>
              </div>
              <div className='border-b border-amber-400/50' />
              <div className='pl-2 flex justify-between text-neutral-400 pr-5'>
                <span>Unarmed</span>
                <span>0</span>
              </div>
            </div>
          </div>

          <div className='flex h-16 items-center relative pl-6'>
            <div className='flex justify-center w-10 flex-none'>
              <div className='h-14 aspect-square relative'>
                <Image
                  fill={true}
                  alt='Support Skill'
                  src='/cmd_support.svg'
                  className='object-contain'
                />
              </div>
            </div>
            <div className='h-14 w-14 aspect-square absolute left-4 -rotate-45'>
              <div className='h-4 w-4 aspect-square border-l-2 border-t-2 border-amber-400/50 absolute top-0 left-0' />
              <div className='h-4 w-4 aspect-square border-r-2 border-b-2 border-amber-400/50 absolute bottom-0 right-0' />
              <div className='h-4 w-4 aspect-square border-r border-b border-amber-400/50 absolute -bottom-1 -right-1' />
            </div>
            <div className='flex-auto flex flex-col pl-6 gap-1 text-sm'>
              <div className='pl-2 flex justify-between text-white uppercase tracking-widest pr-5'>
                <span>Focus</span>
                <span>3</span>
              </div>
              <div className='border-b border-amber-400/50' />
              <div className='pl-2 flex justify-between text-neutral-400 pr-5'>
                <span>No Armor</span>
                <span>0</span>
              </div>
            </div>
          </div>

          <div className='flex h-16 items-center relative pl-6'>
            <div className='flex justify-center w-10 flex-none'>
              <div className='h-14 aspect-square relative'>
                <Image
                  fill={true}
                  alt='Special Skill'
                  src='/cmd_special.svg'
                  className='object-contain'
                />
              </div>
            </div>
            <div className='h-14 w-14 aspect-square absolute left-4 -rotate-45'>
              <div className='h-4 w-4 aspect-square border-l-2 border-t-2 border-amber-400/50 absolute top-0 left-0' />
              <div className='h-4 w-4 aspect-square border-r-2 border-b-2 border-amber-400/50 absolute bottom-0 right-0' />
              <div className='h-4 w-4 aspect-square border-r border-b border-amber-400/50 absolute -bottom-1 -right-1' />
            </div>
            <div className='flex-auto flex flex-col pl-6 gap-1 text-sm'>
              <div className='pl-2 flex justify-between text-white uppercase tracking-widest pr-5'>
                <span>Shuffle</span>
                <span>2</span>
              </div>
              <div className='border-b border-amber-400/50' />
              <div className='pl-2 flex justify-between text-neutral-400 pr-5'>
                <span>No Accessory</span>
                <span>0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
