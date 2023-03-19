import SkillView from '@/components/SkillView'
import { SkillTypes } from '@/enums/SkillTypes'
import { getHeroAttributes, skills } from '@/utils/gameFunctions'
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
  const stats = useMemo(() => {
    const attribs = getHeroAttributes(publicKey)
    const bytes = publicKey.toBytes()
    const availableSkills = {
      [SkillTypes.ATTACK]: skills[bytes[0] % 4],
      [SkillTypes.SUPPORT]: skills[(bytes[1] % 4) + 4],
      [SkillTypes.SPECIAL]: skills[(bytes[2] % 4) + 8],
    }

    return {
      attributes: {
        int: attribs[0],
        spd: attribs[1],
        vit: attribs[2],
        str: attribs[3],
      },
      skills: availableSkills,
    }
  }, [publicKey])

  return (
    <div className='flex gap-5 portrait:flex-col'>
      <div className='flex flex-col gap-5 flex-none'>
        <div className='bg-black/20 w-60 h-60 mx-auto portrait:h-auto aspect-square relative overflow-hidden'>
          {children}
        </div>
        <div className='flex gap-5 text-2xl items-center justify-center'>
          <span>
            HP:{' '}
            <span className='font-bold'>{80 + stats.attributes.vit * 2}</span>
          </span>
          <span>
            MP: <span className='font-bold'>{10 + stats.attributes.int}</span>
          </span>
        </div>
        <div className='flex flex-col'>
          <ul className='grid grid-cols-1 portrait:sm:grid-cols-2 gap-y-3 gap-x-10 text-lg mb-5'>
            <li className='flex items-center justify-center gap-2'>
              <img src='/stat_int.svg' className='w-8 h-8' />
              Intelligence
              <span className='flex-auto text-right font-bold'>
                {stats.attributes.int}
              </span>
            </li>
            <li className='flex items-center justify-center gap-2'>
              <img src='/stat_spd.svg' className='w-8 h-8' />
              Speed
              <span className='flex-auto text-right font-bold'>
                {stats.attributes.spd}
              </span>
            </li>
            <li className='flex items-center justify-center gap-2'>
              <img src='/stat_vit.svg' className='w-8 h-8' />
              Vitality
              <span className='flex-auto text-right font-bold'>
                {stats.attributes.vit}
              </span>
            </li>
            <li className='flex items-center justify-center gap-2'>
              <img src='/stat_str.svg' className='w-8 h-8' />
              Strength
              <span className='flex-auto text-right font-bold'>
                {stats.attributes.str}
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className='border-r border-r-white/5 portrait:hidden'></div>
      <div className='flex flex-auto flex-col gap-5'>
        <div className='flex flex-col'>
          <h2 className='text-xl font-bold mb-3'>Base Skills</h2>
          <ul className='flex flex-col gap-5'>
            <li className='flex gap-5 '>
              <img src='/cmd_attack.svg' className='w-20 h-20' />
              <SkillView skill={stats.skills[SkillTypes.ATTACK]} />
            </li>
            <li className='flex gap-5 '>
              <img src='/cmd_support.svg' className='w-20 h-20' />
              <SkillView skill={stats.skills[SkillTypes.SUPPORT]} />
            </li>
            <li className='flex gap-5 '>
              <img src='/cmd_special.svg' className='w-20 h-20' />
              <SkillView skill={stats.skills[SkillTypes.SPECIAL]} />
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
