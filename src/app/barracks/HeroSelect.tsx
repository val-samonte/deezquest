'use client'

import { SkillTypes } from '@/enums/SkillTypes'
import { Keypair } from '@solana/web3.js'
import { trimAddress } from '@/utils/trimAddress'
import SkillView from '@/components/SkillView'
import { useMemo, useState } from 'react'
import { getHeroAttributes, skills } from '@/utils/gameFunctions'
import { CachedImage } from '@/components/CachedImage'

export default function HeroSelect() {
  const [mintKeypair, setMintKeypair] = useState(Keypair.generate())
  // const mintPubkey = useMemo(() => {
  //   return trimAddress(mintKeypair.publicKey.toBase58())
  // }, [mintKeypair])

  const stats = useMemo(() => {
    const attribs = getHeroAttributes(mintKeypair.publicKey)
    const bytes = mintKeypair.publicKey.toBytes()
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
  }, [mintKeypair])

  return (
    <div className='flex flex-col max-w-3xl gap-5 mx-auto px-5 bg-neutral-900 rounded'>
      <div className='flex gap-5 portrait:flex-col'>
        <div className='flex flex-col gap-5 flex-none'>
          <div className='bg-black/20 w-60 h-60 portrait:w-full portrait:h-auto aspect-square relative overflow-hidden'>
            <CachedImage
              className='w-full h-full object-contain'
              src='https://shdw-drive.genesysgo.net/52zh6ZjiUQ5UKCwLBwob2k1BC3KF2qhvsE7V4e8g2pmD/SolanaSpaceman.png'
            />
            <div className='absolute inset-x-0 bottom-0 text-center font-bold text-xl bg-black/80 text-white'>
              DEMO ONLY
            </div>
          </div>
          {/* <div>Hero ID: {mintPubkey}</div> */}
          <div className='flex gap-5 text-2xl'>
            <span>
              HP:{' '}
              <span className='font-bold'>{80 + stats.attributes.vit * 2}</span>
            </span>
            <span>
              MP: <span className='font-bold'>{10 + stats.attributes.int}</span>
            </span>
          </div>
          <div className='flex flex-col'>
            {/* <h2 className='text-xl font-bold mb-3'>Attributes</h2> */}
            <ul className='grid grid-cols-1 gap-y-3 gap-x-10 text-lg'>
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
      <div className='flex gap-3 justify-center pt-5 border-t border-t-white/5'>
        <button
          type='button'
          className='px-3 py-2 bg-neutral-700 hover:bg-neutral-600 rounded'
          onClick={() => {
            setMintKeypair(Keypair.generate())
          }}
        >
          Reroll
        </button>
        <button
          type='button'
          className='px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded'
          onClick={() => {}}
        >
          Mint NFT
        </button>
      </div>
    </div>
  )
}
