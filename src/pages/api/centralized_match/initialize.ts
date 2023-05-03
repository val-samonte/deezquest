import type { NextApiRequest, NextApiResponse } from 'next'
import { sign } from 'tweetnacl'
import bs58 from 'bs58'
import canonicalize from 'canonicalize'
import { createNonce, dappKey, verifyNonce } from '@/utils/nonce'
import {
  CentralizedMatchResponse,
  InitCentralizedMatchPayload,
} from '@/types/CentralizedMatch'
import kv from '@vercel/kv'
import { hashv } from '@/utils/hashv'
import { Keypair } from '@solana/web3.js'
import { initialize } from '@/game/gameCore'
import { combinePublicKeysAsHash } from '@/utils/combinePublicKeysAsHash'
import { MatchTypes } from '@/enums/MatchTypes'
import { doBotGameLoop } from '@/game/centralizedBotGame'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { payload, signature } = req.body as InitCentralizedMatchPayload

  if (!payload) {
    return res.status(400).json({ error: 'Payload is missing' })
  }

  if (!signature) {
    return res.status(400).json({ error: 'Signature is missing' })
  }

  let publicKey: Uint8Array
  try {
    publicKey = bs58.decode(payload.publicKey)
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

  const burnerOwner = await kv.get(`pubkey_of_${payload.publicKey}`)

  if (!burnerOwner) {
    return res.status(401).json({ error: 'Burner account not linked!' })
  }

  // check energy
  const energy = parseInt(
    (await kv.get(`pubkey_energy_${burnerOwner}`)) ?? '10',
  )

  if (energy <= 0) {
    return res.status(401).json({ error: 'Not enough energy' })
  }

  const score = parseInt((await kv.get(`pubkey_score_${burnerOwner}`)) ?? '0')

  // generate seed based on pubkey + score for the enemy
  // reason: so that even the player quits, he will still encounter the same enemy

  const opponentHash = hashv([Buffer.from(`SEED_${score}_${burnerOwner}`)])
  const opponentNft = Keypair.fromSeed(opponentHash).publicKey.toBase58()

  // void previous game
  // await kv.set(`pubkey_round_${burnerOwner}`, '0')

  const match = {
    matchType: MatchTypes.CENTRALIZED,
    gameHash: combinePublicKeysAsHash(
      burnerOwner as string,
      opponentNft,
    ) as string,
    ongoing: true,
    opponent: {
      nft: opponentNft,
      publicKey: opponentNft,
    },
    player: {
      nft: payload.nft,
      publicKey: payload.publicKey, // burner account!!
    },
  }
  const gameState = initialize(match)

  const botTurns = doBotGameLoop(match, gameState)

  const response = {
    nonce: createNonce(),
    order: 1,
    match,
    gameState,
  }

  const dappSignature = sign.detached(
    hashv([Buffer.from(canonicalize(response) ?? '')]),
    dappKey.secretKey,
  )

  const returnObj: CentralizedMatchResponse = {
    botTurns,
    response,
    signature: bs58.encode(dappSignature),
  }

  await kv.set(`pubkey_energy_${burnerOwner}`, energy - 1 + '')

  res.status(200).json(returnObj)
}
