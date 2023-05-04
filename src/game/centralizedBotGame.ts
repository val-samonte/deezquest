import { commandUseCount } from '@/app/battle/useUseCount'
import { GameState } from '@/atoms/gameStateAtom'
import { Match } from '@/atoms/matchAtom'
import { getBotMove } from './bot'
import bs58 from 'bs58'
import { processGameCombo, swap } from './gameCore'
import { checkWinner, getNextTurn, Hero } from './gameFunctions'
import { PublicKey } from '@solana/web3.js'

export function doBotGameLoop(match: Match, gameState: GameState) {
  let botTurns: any = []

  while (
    match.ongoing &&
    gameState.hashes.length < 100 &&
    match.opponent.nft === gameState.currentTurn
  ) {
    let botHero = gameState.players[match.opponent.nft]
    let playerHero = gameState.players[match.player.nft]
    const move = getBotMove(botHero, commandUseCount(botHero), match, gameState)

    botTurns.push(move.data)

    doMove(
      move.data,
      botHero,
      playerHero,
      match.opponent.nft,
      match.player.nft,
      match,
      gameState,
    )
  }

  return botTurns
}

export function doMove(
  move: any,
  currentHero: Hero,
  opponentHero: Hero,
  currentPublicKey: string,
  opponentPublicKey: string,
  match: Match,
  gameState: GameState,
) {
  if (gameState.hashes.length >= 100) return

  let hash = bs58.decode(gameState.hashes[gameState.hashes.length - 1])

  const swapResult = swap(
    move,
    gameState.currentTurn,
    currentHero,
    gameState.tiles,
    hash,
  )

  const gameComboResult = processGameCombo(
    swapResult.currentPublicKey,
    opponentPublicKey,
    swapResult.currentHero,
    opponentHero,
    swapResult.tiles,
    swapResult.gameHash,
  )

  currentHero = gameComboResult.currentHero
  opponentHero = gameComboResult.opponentHero

  gameState.tiles = [...gameComboResult.tiles] as number[]
  gameState.hashes = [
    ...gameState.hashes,
    bs58.encode(gameComboResult.gameHash),
  ]
  gameState.players = {
    [currentPublicKey]: currentHero,
    [opponentPublicKey]: opponentHero,
  }

  const gameResult = checkWinner(gameState, currentHero, opponentHero)

  if (gameResult) {
    match.ongoing = false
  }

  const nextTurn = getNextTurn(
    currentHero,
    opponentHero,
    new PublicKey(currentPublicKey).toBytes(),
    new PublicKey(opponentPublicKey).toBytes(),
    gameComboResult.gameHash,
  )

  gameState.currentTurn = bs58.encode(nextTurn.pubkey)
}
