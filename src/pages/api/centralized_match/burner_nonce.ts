import type { NextApiRequest, NextApiResponse } from 'next'
import kv from '@vercel/kv'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const pubkey = req.body.pubkey

  if (!pubkey) {
    return res.status(400).json({ error: 'PublicKey is missing' })
  }

  const burnerNonce = await kv.get(`burner_nonce_${pubkey}`)

  res.status(200).send(burnerNonce || 'null')
}
