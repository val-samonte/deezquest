import { GameStateFunctions } from '@/enums/GameStateFunctions'
import { GameState } from '@/atoms/gameStateAtom'
import { Match } from '@/atoms/matchAtom'

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
  }
  signature: string // burner signature of the payload object
}

export interface TurnCentralizedMatchPayload {
  action: {
    type: GameStateFunctions
    data: any
    nonce: string // request_nonce
  }
  previous: {
    response: {
      botTurns: BotTurns[]
      nonce: string // previous nonce from dappKey
      order: number // incremented for every request
      match: Match
      gameState: GameState
    }
    signature: string // dappKey signature of the response object
  }
  signature: string // burner signature (of the action object above)
}

export interface CentralizedMatchResponse {
  response: {
    botTurns: BotTurns[]
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
