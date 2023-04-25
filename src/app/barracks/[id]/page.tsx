'use client'

import { useMetaplex } from '@/atoms/metaplexAtom'
import AttributesDisplay from '@/components/AttributesDisplay'
import SkillView from '@/components/SkillView'
import SpinnerIcon from '@/components/SpinnerIcon'
import { SkillTypes } from '@/enums/SkillTypes'
import { heroFromPublicKey } from '@/utils/gameFunctions'
import { innateSkills } from '@/utils/innateSkills'
import { JsonMetadata } from '@metaplex-foundation/js'
import { PublicKey } from '@solana/web3.js'
import { useEffect, useMemo, useState } from 'react'

export default function HeroDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const metaplex = useMetaplex()
  const [metadata, setMetadata] = useState<JsonMetadata | null>(null)

  const hero = useMemo(() => {
    if (!params.id) return null
    return heroFromPublicKey(new PublicKey(params.id))
  }, [params.id])

  const skills = useMemo(() => {
    if (!hero) return null
    return {
      [SkillTypes.ATTACK]: innateSkills[hero.offensiveSkill],
      [SkillTypes.SUPPORT]: innateSkills[hero.supportiveSkill],
      [SkillTypes.SPECIAL]: innateSkills[hero.specialSkill],
    }
  }, [hero])

  useEffect(() => {
    if (!params.id || !metaplex) return

    metaplex
      .nfts()
      .findByMint({ mintAddress: new PublicKey(params.id) })
      .then((nft) => {
        setMetadata(nft.json)
      })
  }, [params.id, metaplex])

  return (
    <div className='flex flex-col gap-8'>
      <div className='relative w-full xl:max-w-xs mx-auto aspect-square rounded bg-black/80 overflow-hidden'>
        {metadata ? (
          <>
            <img
              className='w-full h-full object-contain'
              src={metadata.image}
            />
          </>
        ) : (
          <div className='absolute inset-0 flex items-center justify-center'>
            <SpinnerIcon />
          </div>
        )}
      </div>
      {hero && skills && (
        <>
          <div className='flex flex-col gap-2 justify-center items-center'>
            <h2 className='text-center text-2xl font-bold'>
              {metadata?.name ?? <span className='opacity-0'>Loading</span>}
            </h2>

            <div className='flex gap-5 text-xl'>
              <span>
                HP: <span className='font-bold'>{hero.hp}</span>
              </span>
              <span>
                MP: <span className='font-bold'>{hero.maxMp}</span>
              </span>
            </div>
          </div>

          <div className='flex flex-col gap-3 xl:gap-5 opacity-50'>
            <h2 className='text-xl font-bold'>Equipment</h2>
            <span className='italic text-sm lg:text-base'>
              Before being able to equip items, you need to{' '}
              <button type='button' className='underline'>
                register
              </button>{' '}
              your Hero
            </span>
            <ul className='grid grid-cols-3 gap-2 md:gap-3 cursor-not-allowed'>
              <li className='bg-black/80 rounded overflow-hidden flex items-center justify-center aspect-square w-full p-3'>
                <img
                  src='/sym_0.png'
                  className='w-full object-contain grayscale brightness-50'
                />
              </li>
              <li className='bg-black/80 rounded overflow-hidden flex items-center justify-center aspect-square w-full p-3'>
                <img
                  src='/sym_1.png'
                  className='w-full object-contain grayscale brightness-50'
                />
              </li>
              <li className='bg-black/80 rounded overflow-hidden flex items-center justify-center aspect-square w-full p-3'>
                <img
                  src='/sym_2.png'
                  className='w-full object-contain grayscale brightness-50'
                />
              </li>
              <li className='text-center text-sm px-2'>Nothing</li>
              <li className='text-center text-sm px-2'>Nothing</li>
              <li className='text-center text-sm px-2'>Nothing</li>
            </ul>
          </div>
          <div className='flex flex-col gap-3 xl:gap-5'>
            <h2 className='text-xl font-bold'>Attributes</h2>
            <AttributesDisplay hero={hero} className='grid grid-cols-4 gap-2' />
            {/* <ul className='grid grid-cols-1 2xl:grid-cols-2 gap-y-2 lg:gap-y-3 gap-x-10 text-sm portrait:text-base md:text-base 2xl:text-lg'>
              <li className='flex items-center justify-center gap-2'>
                <img src='/stat_int.svg' className='w-8 h-8' />
                Intelligence
                <span className='flex-auto text-right font-bold'>
                  {hero.int}
                </span>
              </li>
              <li className='flex items-center justify-center gap-2'>
                <img src='/stat_spd.svg' className='w-8 h-8' />
                Speed
                <span className='flex-auto text-right font-bold'>
                  {hero.spd}
                </span>
              </li>
              <li className='flex items-center justify-center gap-2'>
                <img src='/stat_vit.svg' className='w-8 h-8' />
                Vitality
                <span className='flex-auto text-right font-bold'>
                  {hero.vit}
                </span>
              </li>
              <li className='flex items-center justify-center gap-2'>
                <img src='/stat_str.svg' className='w-8 h-8' />
                Strength
                <span className='flex-auto text-right font-bold'>
                  {hero.str}
                </span>
              </li>
            </ul> */}
          </div>
          <div className='flex flex-col gap-3 xl:gap-5'>
            <h2 className='text-xl font-bold mb-3'>Skills</h2>
            <ul className='flex flex-col gap-5'>
              <li className='flex gap-5 '>
                <img
                  src='/cmd_attack.svg'
                  className='w-14 h-14 xl:w-20 xl:h-20'
                />
                <SkillView skill={skills[SkillTypes.ATTACK]} />
              </li>
              <li className='flex gap-5 '>
                <img
                  src='/cmd_support.svg'
                  className='w-14 h-14 xl:w-20 xl:h-20'
                />
                <SkillView skill={skills[SkillTypes.SUPPORT]} />
              </li>
              <li className='flex gap-5 '>
                <img
                  src='/cmd_special.svg'
                  className='w-14 h-14 xl:w-20 xl:h-20'
                />
                <SkillView skill={skills[SkillTypes.SPECIAL]} />
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
