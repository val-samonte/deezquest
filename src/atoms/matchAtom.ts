import { MatchTypes } from '@/enums/MatchTypes'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'

export interface Player {
  publicKey: string
  nft: string
  peerNonce?: string
  peerId?: string
}

export interface Match {
  matchType: MatchTypes
  ongoing: boolean
  gameHash: string
  opponent: Player
  player: Player
}

export const matchAtom = atomWithStorage<Match | null>(
  'match',
  null,
  createJSONStorage<Match | null>(() => window.localStorage),
)
