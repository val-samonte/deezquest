import type { NextApiRequest, NextApiResponse } from 'next'
import { sign } from 'tweetnacl'
import bs58 from 'bs58'
import { dappKey, verifyNonce } from '@/utils/nonce'

// returns the first half of the burner seeds (16 bytes) in base58
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const message = req.body.message
  const signature = req.body.signature

  if (!message) {
    return res.status(400).json({ error: 'Message is missing' })
  }

  if (!signature) {
    return res.status(400).json({ error: 'Signature is missing' })
  }

  const id = message.split('\n').pop()
  const [pubkey, nonce, burnerNonce] = id.split(':')

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

  let requireLinking = false

  const slice = sign(publicKey, dappKey.secretKey).slice(0, 16)

  res.status(200).json({ data: bs58.encode(slice), requireLinking })
}
