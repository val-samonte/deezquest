import type { NextApiRequest, NextApiResponse } from 'next'
import { createNonce } from '@/utils/nonce'

// short-lived token which contains the nonce signed by the dapp keypair
// nonce is then included to any message which is signed by the user
export default function handler(_: NextApiRequest, res: NextApiResponse) {
  res.status(200).send(createNonce())
}
