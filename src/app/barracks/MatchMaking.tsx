'use client'

import { atom } from 'jotai'

interface MMBlackList {
  address: string
  time: number
}

export const blacklist = atom<MMBlackList[]>([])

export default function MatchMaking() {
  // create peer

  return null
}
