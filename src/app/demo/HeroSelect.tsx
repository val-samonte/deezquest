'use client'

import { heroSkillsAtom, Skill } from '@/atoms/heroSkills'
import { SkillTypes } from '@/enums/SkillTypes'
import { getHeroAttributes } from '@/utils/gameFunctions'
import { Keypair } from '@solana/web3.js'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'

function SkillView({ skill }: { skill: Skill }) {
  return (
    <div className='flex flex-col w-full'>
      <div className='flex items-center border-b border-b-white/5 pb-2 mb-3'>
        <h3 className='text-xl font-bold flex-auto'>{skill.name}</h3>
        <p className='flex items-center gap-3 font-bold'>
          {typeof skill.cost.fire === 'number' && (
            <span className='flex items-center gap-2'>
              <img src='/elem_fire.svg' className='w-8 h-8' />
              {isNaN(skill.cost.fire) ? 'ALL' : skill.cost.fire}
            </span>
          )}
          {typeof skill.cost.wind === 'number' && (
            <span className='flex items-center gap-2'>
              <img src='/elem_wind.svg' className='w-8 h-8' />
              {isNaN(skill.cost.wind) ? 'ALL' : skill.cost.wind}
            </span>
          )}
          {typeof skill.cost.water === 'number' && (
            <span className='flex items-center gap-2'>
              <img src='/elem_water.svg' className='w-8 h-8' />
              {isNaN(skill.cost.water) ? 'ALL' : skill.cost.water}
            </span>
          )}
          {typeof skill.cost.earth === 'number' && (
            <span className='flex items-center gap-2'>
              <img src='/elem_earth.svg' className='w-8 h-8' />
              {isNaN(skill.cost.earth) ? 'ALL' : skill.cost.earth}
            </span>
          )}
        </p>
      </div>
      <p>{skill.desc}</p>
    </div>
  )
}

export default function HeroSelect() {
  const heroSkills = useAtomValue(heroSkillsAtom)
  const [kp, setKp] = useState(Keypair.generate())
  const stats = useMemo(() => {
    const attribs = getHeroAttributes(kp.publicKey)
    const bytes = kp.publicKey.toBytes()
    const skills = {
      [SkillTypes.OFFENSE]: heroSkills[bytes[0] % 4],
      [SkillTypes.SUPPORT]: heroSkills[(bytes[1] % 4) + 4],
      [SkillTypes.SPECIAL]: heroSkills[(bytes[2] % 4) + 8],
    }

    return {
      attributes: {
        int: attribs[0],
        spd: attribs[1],
        vit: attribs[2],
        str: attribs[3],
      },
      skills,
    }
  }, [kp, heroSkills])

  return (
    <div className='flex flex-col max-w-3xl gap-5 mx-auto p-5 bg-neutral-800 rounded'>
      <div className='flex gap-5 portrait:flex-col'>
        <div className='flex flex-col gap-5 flex-none'>
          <img
            className='w-60 h-60 portrait:w-full portrait:h-auto aspect-square'
            src='https://shdw-drive.genesysgo.net/52zh6ZjiUQ5UKCwLBwob2k1BC3KF2qhvsE7V4e8g2pmD/SolanaSpaceman.png'
          />
          <div className='flex gap-5 text-2xl'>
            <span>
              HP:{' '}
              <span className='font-bold'>
                {100 + stats.attributes.vit * 2}
              </span>
            </span>
            <span>
              MP: <span className='font-bold'>{10 + stats.attributes.int}</span>
            </span>
          </div>
        </div>
        <div className='flex flex-auto flex-col gap-5'>
          <div className='flex flex-col'>
            <h2 className='text-xl font-bold mb-3'>Attributes</h2>
            <ul className='grid landscape:grid-cols-2 gap-y-3 gap-x-10 text-lg'>
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
          <div className='flex flex-col'>
            <h2 className='text-xl font-bold mb-3'>Skills</h2>
            <ul className='flex flex-col gap-5'>
              <li className='flex gap-5'>
                <img src='/cmd_attack.svg' className='w-20 h-20' />
                <SkillView skill={stats.skills[SkillTypes.OFFENSE]} />
              </li>
              <li className='flex gap-5'>
                <img src='/cmd_support.svg' className='w-20 h-20' />
                <SkillView skill={stats.skills[SkillTypes.SUPPORT]} />
              </li>
              <li className='flex gap-5'>
                <img src='/cmd_special.svg' className='w-20 h-20' />
                <SkillView skill={stats.skills[SkillTypes.SPECIAL]} />
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className='flex gap-3 justify-center pt-5 border-t border-t-white/5'>
        <button
          type='button'
          className='px-3 py-2 bg-neutral-700 hover:bg-neutral-600 rounded'
          onClick={() => setKp(Keypair.generate())}
        >
          Reroll
        </button>
        <button
          type='button'
          className='px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded'
        >
          Find A Match
        </button>
      </div>
    </div>
  )
}
