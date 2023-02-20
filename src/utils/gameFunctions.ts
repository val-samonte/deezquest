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

export type SkillFn = (commandLevel: number, player: Hero, enemy: Hero) => void

export const burningPunch: SkillFn = (
  commandLevel: number,
  player: Hero,
  enemy: Hero,
) => {
  //
}

export const swiftStrike: SkillFn = (
  commandLevel: number,
  player: Hero,
  enemy: Hero,
) => {
  //
}

export const aquaShot: SkillFn = (
  commandLevel: number,
  player: Hero,
  enemy: Hero,
) => {
  //
}

export const crushingBlow: SkillFn = (
  commandLevel: number,
  player: Hero,
  enemy: Hero,
) => {
  //
}

export const empower: SkillFn = (
  commandLevel: number,
  player: Hero,
  enemy: Hero,
) => {
  //
}

export const tailwind: SkillFn = (
  commandLevel: number,
  player: Hero,
  enemy: Hero,
) => {
  //
}

export const healing: SkillFn = (
  commandLevel: number,
  player: Hero,
  enemy: Hero,
) => {
  //
}

export const manaWall: SkillFn = (
  commandLevel: number,
  player: Hero,
  enemy: Hero,
) => {
  //
}

export const combustion: SkillFn = (
  commandLevel: number,
  player: Hero,
  enemy: Hero,
) => {
  //
}

export const tornado: SkillFn = (
  commandLevel: number,
  player: Hero,
  enemy: Hero,
) => {
  //
}

export const extinguish: SkillFn = (
  commandLevel: number,
  player: Hero,
  enemy: Hero,
) => {
  //
}

export const quake: SkillFn = (
  commandLevel: number,
  player: Hero,
  enemy: Hero,
) => {
  //
}
