import type { NextApiRequest, NextApiResponse } from 'next'
import bs58 from 'bs58'
import { verifyNonce } from '@/utils/nonce'
import { sign } from 'tweetnacl'
import kv from '@vercel/kv'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const message = req.body.message
  const signature = req.body.signature
  const burnerSignature = req.body.burnerSignature
  const burnerPubkey = req.body.pubkey

  if (!message) {
    return res.status(400).json({ error: 'Message is missing' })
  }

  if (!signature) {
    return res.status(400).json({ error: 'Signature is missing' })
  }

  if (!burnerSignature) {
    return res.status(400).json({ error: 'Burner signature is missing' })
  }

  const id = message.split('\n').pop()
  const [pubkey, nonce, burnerNonce] = id.split(':')

  // TODO: skip if already present
  const burner = await kv.get(`burner_${pubkey}`)
  if (burner === burnerPubkey) {
    return res.status(200).json({ success: true })
  }

  let publicKey: Uint8Array
  let burnerPublicKey: Uint8Array

  try {
    publicKey = bs58.decode(pubkey)
  } catch (e) {
    return res.status(401).json({ error: 'Invalid public key' })
  }

  try {
    burnerPublicKey = bs58.decode(burnerPubkey)
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
    ) ||
    !sign.detached.verify(
      Buffer.from(message),
      bs58.decode(burnerSignature),
      burnerPublicKey,
    )
  ) {
    return res.status(401).json({ error: 'Invalid message / signature' })
  }

  try {
    await kv.del(`pubkey_burner_nonce_${burnerNonce}`)
  } catch (e) {}

  try {
    const expiry = 60 * 60 * 24 * 30 // set 30 days
    const key = `burner_${pubkey}`
    await kv.set(key, burnerPubkey)
    await kv.expire(key, expiry)
  } catch (e) {}

  return res.status(200).json({ success: true })
}
