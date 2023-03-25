import SkillView from '@/components/SkillView'
import { SkillTypes } from '@/enums/SkillTypes'
import {
  heroFromPublicKey,
  skills as skillsLookup,
} from '@/utils/gameFunctions'
import { PublicKey } from '@solana/web3.js'
import { ReactNode, useMemo } from 'react'

interface HeroRollDisplayProps {
  publicKey: PublicKey
  children: ReactNode
}

export default function HeroRollDisplay({
  publicKey,
  children,
}: HeroRollDisplayProps) {
  const hero = useMemo(() => {
    if (!publicKey) return null
    return heroFromPublicKey(publicKey)
  }, [publicKey])

  const skills = useMemo(() => {
    if (!hero) return null
    return {
      [SkillTypes.ATTACK]: skillsLookup[hero.offensiveSkill],
      [SkillTypes.SUPPORT]: skillsLookup[hero.supportiveSkill],
      [SkillTypes.SPECIAL]: skillsLookup[hero.specialSkill],
    }
  }, [hero])

  return (
    <div className='flex gap-5 portrait:flex-col'>
      <div className='flex flex-col gap-5 flex-none'>
        <div className='bg-black/20 w-60 h-60 mx-auto portrait:h-auto aspect-square relative overflow-hidden'>
          {children}
        </div>
        <div className='flex gap-5 text-2xl items-center justify-center'>
          <span>
            HP: <span className='font-bold'>{hero?.hp}</span>
          </span>
          <span>
            MP: <span className='font-bold'>{hero?.fireMpCap}</span>
          </span>
        </div>
        <div className='flex flex-col'>
          <ul className='grid grid-cols-1 portrait:sm:grid-cols-2 gap-y-3 gap-x-10 text-lg mb-5'>
            <li className='flex items-center justify-center gap-2'>
              <img src='/stat_int.svg' className='w-8 h-8' />
              Intelligence
              <span className='flex-auto text-right font-bold'>
                {hero?.int}
              </span>
            </li>
            <li className='flex items-center justify-center gap-2'>
              <img src='/stat_spd.svg' className='w-8 h-8' />
              Speed
              <span className='flex-auto text-right font-bold'>
                {hero?.spd}
              </span>
            </li>
            <li className='flex items-center justify-center gap-2'>
              <img src='/stat_vit.svg' className='w-8 h-8' />
              Vitality
              <span className='flex-auto text-right font-bold'>
                {hero?.vit}
              </span>
            </li>
            <li className='flex items-center justify-center gap-2'>
              <img src='/stat_str.svg' className='w-8 h-8' />
              Strength
              <span className='flex-auto text-right font-bold'>
                {hero?.str}
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className='border-r border-r-white/5 portrait:hidden'></div>
      {skills && (
        <div className='flex flex-auto flex-col gap-5'>
          <div className='flex flex-col'>
            <h2 className='text-xl font-bold mb-3'>Base Skills</h2>
            <ul className='flex flex-col gap-5'>
              <li className='flex gap-5 '>
                <img src='/cmd_attack.svg' className='w-20 h-20' />
                <SkillView skill={skills[SkillTypes.ATTACK]} />
              </li>
              <li className='flex gap-5 '>
                <img src='/cmd_support.svg' className='w-20 h-20' />
                <SkillView skill={skills[SkillTypes.SUPPORT]} />
              </li>
              <li className='flex gap-5 '>
                <img src='/cmd_special.svg' className='w-20 h-20' />
                <SkillView skill={skills[SkillTypes.SPECIAL]} />
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
