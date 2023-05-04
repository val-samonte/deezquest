import { GameStateFunctions } from '@/enums/GameStateFunctions'
import { GameState } from '@/atoms/gameStateAtom'
import { Match } from '@/atoms/matchAtom'
import { GameTransitions } from '@/enums/GameTransitions'

export interface BotTurns {
  type: GameStateFunctions.SWAP_NODE
  data: {
    publicKey: string
    origin: string
    node1: { x: number; y: number }
    node2: { x: number; y: number }
  }
}

export interface InitCentralizedMatchPayload {
  payload: {
    publicKey: string // burner
    nonce: string // request_nonce
    nft: string // will not be checked
  }
  signature: string // burner signature of the payload object
}

export interface TurnCentralizedMatchPayloadPrevious {
  response: {
    nonce: string // previous nonce from dappKey
    order: number // incremented for every request
    match: Match
    gameState: GameState
  }
  signature: string // dappKey signature of the response object
}

export interface TurnCentralizedMatchPayload {
  payload: {
    data: any // move data {node1, node2, origin}
    nonce: string // request_nonce
  }
  previous: TurnCentralizedMatchPayloadPrevious
  signature: string // burner signature (of the payload object above)
}

export interface CentralizedMatchResponse {
  botTurns: BotTurns[]
  gameResult?: GameTransitions
  newScore?: number
  response: {
    nonce: string // random value
    order: number // incremented for every request
    match: Match
    // & {
    //   matchType: MatchTypes
    //   gameHash: string // combineHash of opponent.nft + player.nft
    //   opponent: {
    //     nft: string
    //     publicKey: string // dappKey publicKey
    //   }
    //   player: {
    //     nft: string
    //     publicKey: string // burner
    //   }
    // }
    gameState: GameState // post processed of the bot moves
  }
  signature: string // dappKey signature of the response object
}
