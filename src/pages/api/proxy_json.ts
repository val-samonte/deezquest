import type { NextApiRequest, NextApiResponse } from 'next'

// TODO: created to bypass CORS, needs to be removed
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const uri = decodeURIComponent((req.query.uri as string) ?? '')

  const response = await fetch(uri, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const json = await response.json()

  return res.json(json)
}
