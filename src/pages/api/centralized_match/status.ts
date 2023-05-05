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

  res.status(200).json({ score, energy })
}
