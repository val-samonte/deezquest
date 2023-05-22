'use client'

import { useMetaplex } from '@/atoms/metaplexAtom'
import Panel from '@/components/Panel'
import SpinnerIcon from '@/components/SpinnerIcon'
import { getHeroAttributes } from '@/game/gameFunctions'
import { JsonMetadata, Metadata, Nft, Sft } from '@metaplex-foundation/js'
import { PublicKey } from '@solana/web3.js'
import classNames from 'classnames'
import { useEffect, useMemo, useRef, useState } from 'react'

interface HeroCardProps {
  metadata: Metadata | Nft | Sft
}

export function HeroCard({ metadata }: HeroCardProps) {
  const metaplex = useMetaplex()
  const isLoading = useRef(false)
  const [nft, setNft] = useState<JsonMetadata | null>(null)
  // const pathname = usePathname()

  const address = useMemo(() => {
    let address
    if (metadata.model === 'metadata') {
      address = (
        metadata as Metadata<JsonMetadata<string>>
      ).mintAddress.toBase58()
    } else {
      address = (metadata as Nft).mint.address.toBase58()
    }
    return address
  }, [metadata])

  const stats = useMemo(() => {
    const pubkey = new PublicKey(address)
    const attribs = getHeroAttributes(pubkey)
    const sum = attribs[0] + attribs[1] + attribs[2] + attribs[3]

    return {
      int: attribs[0],
      spd: attribs[1],
      vit: attribs[2],
      str: attribs[3],
      rInt: Math.ceil((attribs[0] / sum) * 200) + '%',
      rSpd: Math.ceil((attribs[1] / sum) * 200) + '%',
      rVit: Math.ceil((attribs[2] / sum) * 200) + '%',
      rStr: Math.ceil((attribs[3] / sum) * 200) + '%',
    }
  }, [address])

  useEffect(() => {
    if (
      metadata.model === 'metadata' &&
      !metadata.jsonLoaded &&
      !isLoading.current
    ) {
      isLoading.current = true
      metaplex
        .nfts()
        .load({ metadata })
        .then((nft) => {
          setNft(nft.json)
        })
    } else if (metadata.model === 'nft' || metadata.model === 'sft') {
      setNft(metadata.json)
    }
  }, [metaplex, metadata, setNft])

  return (
    <button>
      <Panel
        subtitle='Lvl 1'
        className={classNames('w-40 xl:w-60 aspect-[3/4] bg-neutral-200/10')}
      >
        <div className='h-full flex flex-col'>
          {nft?.image ? (
            <div className='w-full aspect-square flex-none'>
              <img
                alt={nft.name ?? 'Unknown'}
                src={nft.image}
                className='object-cover w-full'
              />
            </div>
          ) : (
            <div className='absolute inset-0 flex items-center justify-center'>
              <SpinnerIcon />
            </div>
          )}
          <div className='border-t border-amber-400/25 flex-auto grid grid-cols-4 font-bold text-xs lg:text-sm xl:text-base'>
            <div className='flex items-center justify-center relative'>
              <div
                className='absolute inset-x-0 top-0 bg-fire-400/20 w-full'
                style={{ height: stats.rInt }}
              />
              <img src='/stat_int.svg' className='w-4 h-4 flex-none relative' />
              <span className='ml-1 relative'>{stats.int}</span>
            </div>
            <div className='flex items-center justify-center relative'>
              <div
                className='absolute inset-x-0 top-0 bg-wind-400/20 w-full'
                style={{ height: stats.rSpd }}
              />
              <img src='/stat_spd.svg' className='w-4 h-4 flex-none relative' />
              <span className='ml-1 relative'>{stats.spd}</span>
            </div>
            <div className='flex items-center justify-center relative'>
              <div
                className='absolute inset-x-0 top-0 bg-water-400/20 w-full'
                style={{ height: stats.rVit }}
              />
              <img src='/stat_vit.svg' className='w-4 h-4 flex-none relative' />
              <span className='ml-1 relative'>{stats.vit}</span>
            </div>
            <div className='flex items-center justify-center relative'>
              <div
                className='absolute inset-x-0 top-0 bg-earth-400/20 w-full'
                style={{ height: stats.rStr }}
              />
              <img src='/stat_str.svg' className='w-4 h-4 flex-none relative' />
              <span className='ml-1 relative'>{stats.str}</span>
            </div>
          </div>
        </div>
      </Panel>
    </button>
  )
}
