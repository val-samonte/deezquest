import { atomWithStorage, createJSONStorage } from 'jotai/utils'

interface Match {
  matchType: string
  ongoing: boolean
  gameHash: string
  opponent: {
    publicKey: string
    nft: string
    peerNonce: string
  }
}

export const matchAtom = atomWithStorage<Match | null>(
  'match',
  null,
  createJSONStorage<Match | null>(() => window.localStorage),
)
