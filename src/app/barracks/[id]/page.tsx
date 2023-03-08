'use client'

import { metaplexAtom } from '@/atoms/metaplexAtom'
import SkillView from '@/components/SkillView'
import SpinnerIcon from '@/components/SpinnerIcon'
import { SkillTypes } from '@/enums/SkillTypes'
import { getHeroAttributes, skills } from '@/utils/gameFunctions'
import { JsonMetadata } from '@metaplex-foundation/js'
import { PublicKey } from '@solana/web3.js'
import { useAtomValue } from 'jotai'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

export default function HeroDetailsPage() {
  const pathname = usePathname()
  const metaplex = useAtomValue(metaplexAtom)
  const [metadata, setMetadata] = useState<JsonMetadata | null>(null)
  const address = useMemo(() => pathname?.replace(`/barracks/`, ''), [pathname])

  const stats = useMemo(() => {
    if (!address) return null

    const pubkey = new PublicKey(address)
    const attribs = getHeroAttributes(pubkey)
    const bytes = pubkey.toBytes()
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
  }, [address])

  useEffect(() => {
    if (!address || !metaplex) return

    metaplex
      .nfts()
      .findByMint({ mintAddress: new PublicKey(address) })
      .then((nft) => {
        setMetadata(nft.json)
      })
  }, [address, metaplex])

  return (
    <div className='flex flex-col gap-10'>
      <div className='relative w-full xl:max-w-xs mx-auto aspect-square rounded bg-neutral-900 overflow-hidden'>
        {metadata ? (
          <img className='w-full h-full object-contain' src={metadata.image} />
        ) : (
          <div className='absolute inset-0 flex items-center justify-center'>
            <SpinnerIcon />
          </div>
        )}
      </div>
      {stats && (
        <>
          <div className='flex flex-col gap-5'>
            <h2 className='text-xl font-bold'>Attributes</h2>
            <ul className='grid grid-cols-1 xl:grid-cols-2 gap-y-3 gap-x-10 text-lg'>
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

          <div className='flex flex-col gap-5'>
            <h2 className='text-xl font-bold mb-3'>Equipped Skills</h2>
            <ul className='flex flex-col gap-5'>
              <li className='flex gap-5 '>
                <img
                  src='/cmd_attack.svg'
                  className='w-14 h-14 xl:w-20 xl:h-20'
                />
                <SkillView skill={stats.skills[SkillTypes.ATTACK]} />
              </li>
              <li className='flex gap-5 '>
                <img
                  src='/cmd_support.svg'
                  className='w-14 h-14 xl:w-20 xl:h-20'
                />
                <SkillView skill={stats.skills[SkillTypes.SUPPORT]} />
              </li>
              <li className='flex gap-5 '>
                <img
                  src='/cmd_special.svg'
                  className='w-14 h-14 xl:w-20 xl:h-20'
                />
                <SkillView skill={stats.skills[SkillTypes.SPECIAL]} />
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
