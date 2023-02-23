import crypto from 'crypto'
import bs58 from 'bs58'

export const combinePublicKeysAsHash = (
  publicKey1: string, // assumes bs58
  publicKey2: string, // assumes bs58
  encode = true,
) => {
  const sortedKeys = [publicKey1, publicKey2].sort()
  const concatenatedKeys = sortedKeys.join('')
  const hash = crypto.createHash('sha256').update(concatenatedKeys).digest()
  return encode ? bs58.encode(hash) : hash
}
