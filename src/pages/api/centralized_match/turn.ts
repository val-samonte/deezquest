import type { NextApiRequest, NextApiResponse } from 'next'
import { sign } from 'tweetnacl'
import bs58 from 'bs58'
import { dappKey, verifyNonce } from '@/utils/nonce'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const message = req.body.message
  const signature = req.body.signature

  if (!message) {
    return res.status(400).json({ error: 'Message is missing' })
  }

  if (!signature) {
    return res.status(400).json({ error: 'Signature is missing' })
  }

  const id = message.split('\n').pop()
  const [pubkey, nonce] = id.split(':')

  let publicKey: Uint8Array
  try {
    publicKey = bs58.decode(pubkey)
  } catch (e) {
    return res.status(401).json({ error: 'Invalid public key' })
  }

  if (!nonce || !verifyNonce(nonce)) {
    return res.status(401).json({ error: 'Invalid nonce' })
  }

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
