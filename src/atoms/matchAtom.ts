import { MatchTypes } from '@/enums/MatchTypes'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'

export interface Player {
  publicKey: string
  nft: string
  peerNonce?: string
  peerId?: string
}

export interface FriendlyMatch {
  matchType: MatchTypes.FRIENDLY
  ongoing: boolean
  gameHash: string
  opponent: Player
  player: Player
}

export interface BotMatch {
  matchType: MatchTypes.BOT
  ongoing: boolean
  gameHash: string
  opponent: Player
  player: Player
}

export interface SpecialMatch {
  matchType: MatchTypes.SPECIAL
  ongoing: boolean
  gameHash: string
  opponent: Player
  player: Player
}

type Match = FriendlyMatch | BotMatch | SpecialMatch

export const matchAtom = atomWithStorage<Match | null>(
  'match',
  null,
  createJSONStorage<Match | null>(() => window.localStorage),
)
