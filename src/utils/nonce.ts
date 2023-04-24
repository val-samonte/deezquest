import { Keypair } from '@solana/web3.js'
import { sign } from 'tweetnacl'
import bs58 from 'bs58'
import { getNextHash } from './getNextHash'

export const dappKey = Keypair.fromSecretKey(
  new Uint8Array(bs58.decode(process.env.APP_KEYPAIR ?? '')),
)

export function createNonce() {
  const nonce = Keypair.generate().publicKey.toBase58().substring(0, 12)
  const time = new Date().getTime()
  const data = nonce + '.' + time
  const signature = sign(Buffer.from(data), dappKey.secretKey)
  return data + '.' + bs58.encode(getNextHash([signature])).substring(0, 12)
}

export function verifyNonce(token: string) {
  const currentTime = new Date().getTime()

  // token should have 3 parts
  const parts = token.split('.')
  if (parts.length !== 3) return false

  // verify time expiry (should be less than 5 minutes old)
  if (parseInt(parts[1]) + 300_000 < currentTime) return false

  // verify authenticity
  const data = parts[0] + '.' + parts[1]
  const signature = sign(Buffer.from(data), dappKey.secretKey)
  if (parts[2] !== bs58.encode(getNextHash([signature])).substring(0, 12))
    return false

  return true
}
