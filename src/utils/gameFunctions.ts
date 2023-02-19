import { Hero } from '@/atoms/heroAtom'
import crypto from 'crypto'

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

export const burningPunch = (
  commandLevel: number,
  player: Hero,
  enemy: Hero,
) => {
  // Burning Punch	5 FIRE
  // Deal 1/2/3 damage + gap of both players' FIRE MANA (pre-cast)
}

export const aeroSlash = (commandLevel: number, player: Hero, enemy: Hero) => {
  // Aeroslash	3 WIND
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
  // Deal damage based on EARTH mana, does not scale
}

export const meditate = (commandLevel: number, player: Hero, enemy: Hero) => {
  // Meditate	5 FIRE
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

export const incinerate = (commandLevel: number, player: Hero, enemy: Hero) => {
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
