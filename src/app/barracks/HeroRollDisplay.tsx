import AttributesDisplay from '@/components/AttributesDisplay'
import SkillView from '@/components/SkillView'
import { SkillTypes } from '@/enums/SkillTypes'
import { heroFromPublicKey } from '@/game/gameFunctions'
import { innateSkills } from '@/utils/innateSkills'
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
      [SkillTypes.ATTACK]: innateSkills[hero.offensiveSkill],
      [SkillTypes.SUPPORT]: innateSkills[hero.supportiveSkill],
      [SkillTypes.SPECIAL]: innateSkills[hero.specialSkill],
    }
  }, [hero])

  return (
    <div className='flex gap-10 portrait:flex-col'>
      <div className='flex flex-col gap-5 flex-none landscape:max-w-min'>
        <div className='bg-black/20 w-60 h-60 mx-auto portrait:h-auto aspect-square relative overflow-hidden'>
          {children}
        </div>
        {/* <div className='flex gap-5 text-2xl items-center justify-center'>
          <span>
            HP: <span className='font-bold'>{hero?.hp}</span>
          </span>
          <span>
            MP: <span className='font-bold'>{hero?.maxMp}</span>
          </span>
        </div> */}
        <div className='flex flex-col'>
          {hero && <AttributesDisplay hero={hero} />}
        </div>
      </div>
      {/* <div className='flex-none border-r border-r-white/5 portrait:hidden'></div> */}
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
