'use client'

import { imageCompression } from '@/utils/imageCompression'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { idbAtom } from './idbAtom'

export const cachedImageAtom = atomFamily((key: string) =>
  atom(async (get) => {
    const idb = await get(idbAtom)

    const arrayBuffer = await idb.get('bin', key)
    if (arrayBuffer) {
      const blob = new Blob([arrayBuffer], { type: 'image/jpeg' })
      return blob
    }
    const blob = await imageCompression(key, 0.5)
    const newArrayBuffer = await blob.arrayBuffer()
    await idb.add('bin', newArrayBuffer, key)

    return blob
  }),
)
