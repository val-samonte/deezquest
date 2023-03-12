import { atomWithStorage, createJSONStorage } from 'jotai/utils'

export interface Player {
  publicKey: string
  nft: string
  peerNonce: string
  peerId?: string
}

interface Match {
  matchType: string
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
