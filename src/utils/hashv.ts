import crypto from 'crypto'

export const hashv = (seeds: Uint8Array[]) => {
  return crypto.createHash('sha256').update(Buffer.concat(seeds)).digest()
}
