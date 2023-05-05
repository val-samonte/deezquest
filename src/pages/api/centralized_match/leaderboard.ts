import type { NextApiRequest, NextApiResponse } from 'next'
import kv from '@vercel/kv'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const id = req.query.publicKey

  let leaderboard: {
    score: number
    owner: string
    date: number
  }[] = (await kv.get('leaderboard')) ?? []

  // update leaderboard
  if (typeof id === 'string') {
    try {
      const score = ((await kv.get(`pubkey_score_${id}`)) as number) ?? 0
      const entry = {
        score: score,
        owner: id,
        date: new Date().getTime(),
      }

      leaderboard = leaderboard.filter((t) => t.owner !== id)

      for (let i = 0; i < 20; i++) {
        if (typeof leaderboard[i] === 'undefined') {
          leaderboard[i] = entry
          break
        } else if (score > leaderboard[i].score) {
          leaderboard = leaderboard.splice(i, 0, entry).slice(0, 20)
          break
        }
      }

      await kv.set('leaderboard', leaderboard)
    } catch (e) {
      console.log(e)
    }
  }

  res.status(200).json(leaderboard)
}
