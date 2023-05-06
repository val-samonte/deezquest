import type { NextApiRequest, NextApiResponse } from 'next'
import kv from '@vercel/kv'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const id = req.query.publicKey

  if (!id) {
    return res.status(200).send('null')
  }

  const score = parseInt((await kv.get(`pubkey_score_${id}`)) ?? '0')
  const energy = parseInt((await kv.get(`pubkey_energy_${id}`)) ?? '10')

  let ttl = await kv.ttl(`pubkey_energy_${id}`)
  if (ttl < 0) {
    await kv.expire(`pubkey_energy_${id}`, 60 * 60 * 24)
    ttl = 60 * 60 * 24
  }

  res.status(200).json({ score, energy, reset: ttl })
}
