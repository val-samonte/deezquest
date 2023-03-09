'use client'

import { JsonMetadata, Metadata, Nft } from '@metaplex-foundation/js'
import classNames from 'classnames'
import { useAtomValue } from 'jotai'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { userNftCollectionAtom } from './HeroContentPage'

export default function HeroActionButtons() {
  const pathname = usePathname()
  const collection = useAtomValue(userNftCollectionAtom)

  const isNftOwner = useMemo(() => {
    if (!pathname) return false
    return !!collection.find((nft) => {
      let address
      if (nft.model === 'metadata') {
        address = (nft as Metadata<JsonMetadata<string>>).mintAddress.toBase58()
      } else {
        address = (nft as Nft).mint.address.toBase58()
      }
      return pathname.includes(address)
    })
  }, [pathname, collection])

  return (
    <>
      {isNftOwner && (
        <button
          type='button'
          className={classNames(
            'flex-auto px-3 py-2',
            'flex items-center justify-center',
            'bg-red-700 hover:bg-red-600 rounded',
          )}
        >
          <img src='/BattleIcon.svg' className='w-6 h-6' />
          <span className='ml-2 font-bold uppercase'>Battle</span>
        </button>
      )}
    </>
  )
}
