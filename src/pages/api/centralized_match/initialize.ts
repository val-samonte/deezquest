import type { NextApiRequest, NextApiResponse } from 'next'
import { sign } from 'tweetnacl'
import bs58 from 'bs58'
import canonicalize from 'canonicalize'
import { dappKey, verifyNonce } from '@/utils/nonce'
import { InitCentralizedMatchPayload } from '@/types/CentralizedMatch'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
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

  // const slice = sign(publicKey, dappKey.secretKey)

  // you give me
  // - payload
  // -- publicKey
  // -- nonce
  // -- match
  // -- signature
  //
  // i'll verify
  // - initial board state
  //
  // i'll return
  // - gameState
  // - canonical signed by backend gameState
  //
  // you give me
  // - payload
  // -- swap turn
  // -- publicKey
  // -- nonce
  // -- match
  // -- signature
  // -- gameState
  // - current payload canonical signed by backend
  //
  // i'll return
  // - gameState
  // - canonical signed by backend gameState
}
