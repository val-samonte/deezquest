import { Hero } from '@/atoms/heroAtom'
import { PublicKey } from '@solana/web3.js'
import crypto from 'crypto'

// everything here should be replicated 1:1 in solana programs

export const getHeroAttributes = (pubkey: PublicKey) => {
  let attribs = [
    1, // INT - Mana cap increase
    1, // SPD - More likely to get a turn
    1, // VIT - Flat HP increase
    1, // STR - Able to carry heavier equipment
  ]
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

export const getNextTurn = (
  hero1: Hero,
  hero2: Hero,
  pubkey1: Uint8Array,
  pubkey2: Uint8Array,
  gameHash: Uint8Array,
) => {
  while (hero1.turnTime < 200 && hero2.turnTime < 200) {
    hero1.turnTime += hero1.spd
    hero2.turnTime += hero2.spd
  }

  if (hero1.turnTime >= 200 && hero2.turnTime >= 200) {
    const seq1 = [
      hero1.turnTime,
      hero1.spd,
      hero1.vit,
      hero1.str,
      hero1.int,
      hero1.hp,
      ...Array.from(
        crypto
          .createHash('sha256')
          .update(Buffer.concat([pubkey1, gameHash]))
          .digest(),
      ),
    ]
    const seq2 = [
      hero2.turnTime,
      hero2.spd,
      hero2.vit,
      hero2.str,
      hero2.int,
      hero2.hp,
      ...Array.from(
        crypto
          .createHash('sha256')
          .update(Buffer.concat([pubkey2, gameHash]))
          .digest(),
      ),
    ]

    for (let i = 0; i < seq1.length; i++) {
      if (seq1[i] > seq2[i]) {
        return hero1
      } else if (seq1[i] < seq2[i]) {
        return hero2
      }
    }

    // shouldn't reach this point, unless both hero 1 and hero 2 are the same
    throw new Error(
      'Heroes are too identical, even having the same public key hash result.',
    )
  } else if (hero1.turnTime >= 200) {
    return hero1
  }

  return hero2
}

export type CommandFn = (
  commandLevel: number,
  player: Hero,
  enemy: Hero,
) => void

export const burningPunch = (
  commandLevel: number,
  player: Hero,
  enemy: Hero,
) => {
  // Burning Punch	5 FIRE
  // Deals normal attack + the gap between FIRE MANA of both heroes
}

export const swiftStrike = (
  commandLevel: number,
  player: Hero,
  enemy: Hero,
) => {
  // Swiftstrike	3 WIND
  // Deal 3/4/5 damage
}

export const aquaShot = (commandLevel: number, player: Hero, enemy: Hero) => {
  // Aquashot	4 WATER
  // Deal 2/6/8 damage
}

export const crushingBlow = (
  commandLevel: number,
  player: Hero,
  enemy: Hero,
) => {
  // Crushing Blow	ALL EARTH MANA
  // Deals 1 damage per EARTH MANA of the user. LVL 2 ignores ARMOR. LVL 3 ignores SHELL.
}

export const enlighten = (commandLevel: number, player: Hero, enemy: Hero) => {
  // Enlighten 5 FIRE
  // Adds 1/2/3 to normal attack during the match, stacks indefinitely
}

export const tailwind = (commandLevel: number, player: Hero, enemy: Hero) => {
  // Tailwind	3 WIND
  // Adds 1/2/3 SPD during the match, stacks indefinitely
}

export const healing = (commandLevel: number, player: Hero, enemy: Hero) => {
  // Healing	4 WATER
  // Recover 3/4/5 HP
}

export const barrier = (commandLevel: number, player: Hero, enemy: Hero) => {
  // Barrier	ALL EARTH MANA
  // Convert each EARTH MANA into SHIELD, does not scale
}

export const combustion = (commandLevel: number, player: Hero, enemy: Hero) => {
  // Incinerate	8 FIRE
  // Converts all WATER MANA in the board into FIRE MANA, deals damage on how many are converted
}

export const tornado = (commandLevel: number, player: Hero, enemy: Hero) => {
  // Tornado	10 WIND
  // Shuffles the board, deals damage based on how many WIND + EARTH MANA appears after the shuffle
}

export const extinguish = (commandLevel: number, player: Hero, enemy: Hero) => {
  // Extinguish	8 WATER
  // Converts all FIRE MANA in the board into WATER MANA, recover HP based on how many are converted
}

export const quake = (commandLevel: number, player: Hero, enemy: Hero) => {
  // Quake	10 EARTH MANA
  // Deals 30 damage on both players, damage is reduced respectively based on each player's WIND MANA
}
