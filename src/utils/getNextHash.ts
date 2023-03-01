import crypto from 'crypto'

export const getNextHash = (seeds: Uint8Array[]) => {
  return crypto.createHash('sha256').update(Buffer.concat(seeds)).digest()
}
