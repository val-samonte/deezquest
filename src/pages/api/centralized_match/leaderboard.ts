import type { NextApiRequest, NextApiResponse } from 'next'
import kv from '@vercel/kv'

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(await kv.get('leaderboard'))
}
