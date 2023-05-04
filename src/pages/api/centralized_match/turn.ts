import type { NextApiRequest, NextApiResponse } from 'next'
import { sign } from 'tweetnacl'
import bs58 from 'bs58'
import canonicalize from 'canonicalize'
import { createNonce, dappKey, verifyNonce } from '@/utils/nonce'
import {
  CentralizedMatchResponse,
  TurnCentralizedMatchPayload,
} from '@/types/CentralizedMatch'
import kv from '@vercel/kv'
import { hashv } from '@/utils/hashv'
import { checkWinner } from '@/game/gameFunctions'
import { doBotGameLoop, doMove } from '@/game/centralizedBotGame'
import { GameTransitions } from '@/enums/GameTransitions'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { payload, previous, signature } =
    req.body as TurnCentralizedMatchPayload

  if (!payload) {
    return res.status(400).json({ error: 'Payload is missing' })
  }

  if (!previous) {
    return res.status(400).json({ error: 'Previous is missing' })
  }

  if (!signature) {
    return res.status(400).json({ error: 'Signature is missing' })
  }

  let publicKey: Uint8Array
  let burnerPubkey = previous.response.match.player.publicKey
  try {
    publicKey = bs58.decode(burnerPubkey)
  } catch (e) {
    return res.status(401).json({ error: 'Invalid public key' })
  }

  if (!payload.nonce || !verifyNonce(payload.nonce)) {
    return res.status(401).json({ error: 'Invalid nonce' })
  }

  const message = canonicalize(payload)!

  if (
    !sign.detached.verify(
      Buffer.from(message),
      bs58.decode(signature),
      publicKey,
    )
  ) {
    return res.status(401).json({ error: 'Invalid message / signature' })
  }

  // verify previous signature
  const dappSignature = sign.detached(
    hashv([Buffer.from(canonicalize(previous.response) ?? '')]),
    dappKey.secretKey,
  )

  if (bs58.encode(dappSignature) !== previous.signature) {
    return res.status(401).json({ error: 'Invalid previous signature' })
  }

  const playerNft = previous.response.match.player.nft
  const botNft = previous.response.match.opponent.nft
  const playerHero = previous.response.gameState.players[playerNft]
  const botHero = previous.response.gameState.players[botNft]

  if (
    !previous.response.match.ongoing ||
    previous.response.gameState.hashes.length >= 100
  ) {
    return res.status(200).json({
      botTurns: [],
      response: previous.response,
      signature: previous.signature,
      gameResult:
        checkWinner(previous.response.gameState, playerHero, botHero) ||
        undefined,
    } as CentralizedMatchResponse)
  }

  // stops replay attacks, preventing kv consumptions
  // if (!verifyNonce(previous.response.nonce)) {
  //   return res.status(401).json({ error: 'Invalid previous nonce' })
  // }

  const currentOrder = previous.response.order + 1
  const match = previous.response.match
  const gameState = previous.response.gameState

  doMove(payload.data, playerHero, botHero, playerNft, botNft, match, gameState)

  const botTurns = doBotGameLoop(match, gameState)

  let gameResult =
    checkWinner(
      previous.response.gameState,
      previous.response.gameState.players[playerNft],
      previous.response.gameState.players[botNft],
    ) || undefined

  console.log(gameResult, currentOrder)

  let newScore: number | undefined = undefined

  if (gameResult) {
    const existing = await kv.get(`gamehash_${match.gameHash}`)
    if (!existing) {
      const burnerOwner = (await kv.get(
        `pubkey_of_${previous.response.match.player.publicKey}`,
      )) as string
      const previousScore = parseInt(
        (await kv.get(`pubkey_score_${burnerOwner}`)) ?? '0',
      )
      // compute score
      const score =
        gameResult === GameTransitions.LOSE
          ? 100
          : gameResult === GameTransitions.DRAW
          ? 200
          : 1000 + Math.floor(10000 / previous.response.gameState.hashes.length)

      newScore = previousScore + score

      await kv.set(`pubkey_score_${burnerOwner}`, newScore + '')
      await kv.set(
        `gamehash_${match.gameHash}`,
        JSON.stringify({ score, owner: burnerOwner }),
      )

      // update leaderboard
      let leaderboard: {
        score: number
        owner: string
        date: number
      }[] = (await kv.get('leaderboard')) ?? []

      const entry = {
        score: newScore,
        owner: burnerOwner,
        date: new Date().getTime(),
      }

      // remove the player first
      leaderboard = leaderboard.filter((t) => t.owner !== burnerOwner)

      for (let i = 0; i < 20; i++) {
        if (typeof leaderboard[i] === 'undefined') {
          leaderboard[i] = entry
          break
        } else if (newScore > leaderboard[i].score) {
          leaderboard = leaderboard.splice(i, 0, entry).slice(0, 20)
          break
        }
      }
      await kv.set('leaderboard', leaderboard)
    }
  }

  const response = {
    nonce: createNonce(),
    order: currentOrder,
    match,
    gameState,
  }

  const newDappSignature = sign.detached(
    hashv([Buffer.from(canonicalize(response) ?? '')]),
    dappKey.secretKey,
  )

  const returnObj: CentralizedMatchResponse = {
    botTurns,
    gameResult,
    newScore,
    response: {
      nonce: response.nonce,
      order: response.order,
    },
    signature: bs58.encode(newDappSignature),
  }

  res.status(200).json(returnObj)
}
