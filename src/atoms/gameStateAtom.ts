import { atom } from 'jotai'
import { atomFamily, atomWithStorage, createJSONStorage } from 'jotai/utils'
import { checkWinner, getNextTurn, Hero } from '@/game/gameFunctions'
import { matchAtom } from './matchAtom'
import { MatchTypes } from '@/enums/MatchTypes'
import { initialize, processGameCombo, swap } from '@/game/gameCore'
import { GameStateFunctions } from '@/enums/GameStateFunctions'
import { GameTransitions } from '@/enums/GameTransitions'
import { PublicKey } from '@solana/web3.js'
import bs58 from 'bs58'

export interface GameState {
  hashes: string[]
  tiles: number[]
  currentTurn: string
  players: {
    [key: string]: Hero
  }
}

export const gamesStateAtom = atomFamily((matchId: string) =>
  atomWithStorage<GameState | null>(
    `games_${matchId}`,
    null,
    createJSONStorage<GameState | null>(() => sessionStorage),
  ),
)

export const matchIdAtom = atom((get) => {
  const match = get(matchAtom)
  if (!match) return null

  if (
    match.matchType === MatchTypes.FRIENDLY ||
    match.matchType === MatchTypes.BOT
  ) {
    return match.gameHash
  }

  return null
})

export const gameStateAtom = atom(
  (get) => {
    const matchId = get(matchIdAtom)
    if (!matchId) return null

    return get(gamesStateAtom(matchId)) ?? null
  },
  (get, set, data: GameState | null) => {
    const matchId = get(matchIdAtom)
    if (!matchId) return null

    set(gamesStateAtom(matchId), data)
  },
)

export const gameTransitionQueueAtom = atom<any[]>([])
export const gameResultAtom = atom('')

export const gameFunctions = atom(
  null,
  (get, set, action: { type: string; data?: any }) => {
    let match = get(matchAtom)
    let gameState = get(gameStateAtom)
    if (!match) return

    if (!gameState) {
      gameState = initialize(match)
    }

    const isMe = match.player.nft === gameState?.currentTurn
    let queue = get(gameTransitionQueueAtom)
    let hash = bs58.decode(gameState.hashes[gameState.hashes.length - 1])

    let currentHero = gameState.players[gameState.currentTurn]
    let [opponentPubkey, opponentHero] = Object.entries(gameState.players).find(
      (p) => p[0] !== gameState!.currentTurn,
    )!

    // directly mutating this will affect the display, so clone them
    currentHero = { ...currentHero }
    opponentHero = { ...opponentHero }

    switch (action.type) {
      case GameStateFunctions.INIT: {
        queue.push({
          type: GameTransitions.SET,
          turn: gameState.currentTurn,
          tiles: gameState.tiles,
          heroes: gameState.players,
        })

        const gameResult = checkWinner(
          gameState,
          isMe ? currentHero : opponentHero,
          !isMe ? currentHero : opponentHero,
        )

        if (gameResult) {
          queue.push({
            type: gameResult,
          })
        }

        set(gameTransitionQueueAtom, [...queue])
        break
      }

      case GameStateFunctions.SWAP_NODE: {
        if (get(gameResultAtom) !== '') return
        if (queue.length > 0) return
        if (action.data.publicKey !== gameState.currentTurn) return

        const swapResult = swap(
          action.data,
          gameState.currentTurn,
          currentHero,
          gameState.tiles,
          hash,
        )

        queue = [...queue, ...swapResult.queue]

        const gameComboResult = processGameCombo(
          swapResult.currentPublicKey,
          opponentPubkey,
          swapResult.currentHero,
          opponentHero,
          swapResult.tiles,
          swapResult.gameHash,
        )

        queue = [...queue, ...gameComboResult.queue]
        currentHero = gameComboResult.currentHero
        opponentHero = gameComboResult.opponentHero

        gameState.tiles = [...gameComboResult.tiles] as number[]
        gameState.hashes = [
          ...gameState.hashes,
          bs58.encode(gameComboResult.gameHash),
        ]
        gameState.players = {
          [gameState.currentTurn]: currentHero,
          [opponentPubkey]: opponentHero,
        }

        const gameResult = checkWinner(
          gameState,
          isMe ? currentHero : opponentHero,
          !isMe ? currentHero : opponentHero,
        )

        if (gameResult) {
          queue.push({
            type: gameResult,
          })
        }

        queue.push({
          type: GameTransitions.SET,
          heroes: { ...gameState.players },
        })

        set(gameTransitionQueueAtom, [...queue])
        break
      }
    }

    const nextTurn = getNextTurn(
      currentHero,
      opponentHero,
      new PublicKey(gameState.currentTurn).toBytes(),
      new PublicKey(opponentPubkey).toBytes(),
      hash,
    )

    set(gameStateAtom, {
      ...gameState,
      currentTurn: bs58.encode(nextTurn.pubkey),
    })
  },
)
