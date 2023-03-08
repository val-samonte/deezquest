'use client'

import SpinnerIcon from '@/components/SpinnerIcon'
import { SkillTypes } from '@/enums/SkillTypes'
import { getHeroAttributes, skills } from '@/utils/gameFunctions'
import { JsonMetadata } from '@metaplex-foundation/js'
import { PublicKey } from '@solana/web3.js'
import classNames from 'classnames'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

interface HeroCardProps {
  basePath: string
  address: string
  uri: string
}

export function HeroCard({ uri, basePath, address }: HeroCardProps) {
  const [metadata, setMetadata] = useState<JsonMetadata | null>(null)

  const stats = useMemo(() => {
    const pubkey = new PublicKey(address)
    const attribs = getHeroAttributes(pubkey)

    return {
      int: attribs[0],
      spd: attribs[1],
      vit: attribs[2],
      str: attribs[3],
    }
  }, [address])

  useEffect(() => {
    fetch(`/api/proxy_json?uri=${encodeURIComponent(uri)}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'force-cache',
    })
      .then((response) => response.json())
      .then((metadata) => setMetadata(metadata))
  }, [uri, setMetadata])

  return (
    <Link href={`${basePath}/${address}`}>
      <div
        className={classNames(
          'w-40 xl:w-60 aspect-[3/4] bg-neutral-900',
          'relative rounded overflow-hidden',
          'flex flex-col items-center',
        )}
      >
        {metadata ? (
          <img className='h-full object-cover' src={metadata.image} />
        ) : (
          <div className='absolute inset-0 flex items-center justify-center'>
            <SpinnerIcon />
          </div>
        )}
        <div className='absolute inset-x-0 bottom-0 grid grid-cols-4 gap-2 p-2 text-sm font-bold'>
          <div className='flex items-center bg-neutral-900 rounded px-2 py-1'>
            <img src='/stat_int.svg' className='w-4 h-4 flex-none' />
            <span className='ml-auto'>{stats.int}</span>
          </div>
          <div className='flex items-center bg-neutral-900 rounded px-2 py-1'>
            <img src='/stat_spd.svg' className='w-4 h-4 flex-none' />
            <span className='ml-auto'>{stats.spd}</span>
          </div>
          <div className='flex items-center bg-neutral-900 rounded px-2 py-1'>
            <img src='/stat_vit.svg' className='w-4 h-4 flex-none' />
            <span className='ml-auto'>{stats.vit}</span>
          </div>
          <div className='flex items-center bg-neutral-900 rounded px-2 py-1'>
            <img src='/stat_str.svg' className='w-4 h-4 flex-none' />
            <span className='ml-auto'>{stats.str}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
