import { PublicKey } from '@solana/web3.js'

// [FIRE, WIND, WATER, EARTH]
// [INT, SPD, VIT, STR]
// INT - Mana cap increase
// SPD - More likely to get a turn
// VIT - Flat HP increase
// STR - Able to carry heavier equipment
export const getHeroAttributes = (pubkey: PublicKey) => {
  let attribs = [1, 1, 1, 1]
  let cursor = 0
  let remaining = 17
  let bytes = pubkey.toBytes()

  for (let i = 0; i < 256 && remaining > 0; i++) {
    if (bytes[i % 32] % 2 === 0 || attribs[cursor] === 10) {
      cursor = (cursor + 1) % 4
    } else {
      attribs[cursor] += 1
      remaining -= 1
    }
  }

  // very unlikely to happen
  if (remaining !== 0) {
    attribs = [5, 5, 5, 5]
    attribs[bytes[0] % 4] += 1
  }

  return attribs
}
