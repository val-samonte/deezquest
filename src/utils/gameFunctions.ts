import { HeroAttributes } from '../enums/HeroAttributes'
import { PublicKey } from '@solana/web3.js'
import crypto from 'crypto'
import { Skill, innateSkills } from './innateSkills'
import { computeAttribute } from './computeAttribute'

export interface Hero {
  hp: number
  maxHp: number
  maxMp: number
  armor: number
  shell: number
  turnTime: number
  baseDmg: number
  weight: number
  carryCap: number
  fireMp: number
  windMp: number
  watrMp: number
  eartMp: number
  int: number
  spd: number
  vit: number
  str: number
  poison: number
  poisonStack: number
  envenom: number
  regen: number
  regenStack: number
  reflect: number
  haste: number
  slow: number
  sleep: number
  silence: number
  confusion: number
  berserk: number
  autoLife: number
  trance: number
  xTrance: number
  offensiveSkill: number
  supportiveSkill: number
  specialSkill: number
}

// everything here should be replicated 1:1 in solana programs

export const getHeroAttributes = (pubkey: PublicKey) => {
  let attribs = [
    1, // INT - Max MP increase
    1, // SPD - More likely to get additional turn
    1, // VIT - Max HP increase
    1, // STR - BaseDmg & Carry Cap
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

export const heroFromPublicKey = (publicKey: string | PublicKey): Hero => {
  if (typeof publicKey === 'string') {
    publicKey = new PublicKey(publicKey)
  }

  const [int, spd, vit, str] = getHeroAttributes(publicKey)
  const hp = computeAttribute(HeroAttributes.VIT, vit).totalHp!
  const { baseDmg, carryCap } = computeAttribute(HeroAttributes.STR, str)
  const bytes = publicKey.toBytes()

  return {
    hp,
    maxHp: hp,
    maxMp: computeAttribute(HeroAttributes.INT, int).totalMp!,
    armor: 0,
    shell: 0,
    turnTime: 0,
    baseDmg: baseDmg!,
    weight: 0,
    carryCap: carryCap!,
    fireMp: 0,
    windMp: 0,
    watrMp: 0,
    eartMp: 0,
    int: int,
    spd: spd,
    vit: vit,
    str: str,
    poison: 0,
    poisonStack: 0,
    envenom: 0,
    regen: 0,
    regenStack: 0,
    reflect: 0,
    haste: 0,
    slow: 0,
    sleep: 0,
    silence: 0,
    confusion: 0,
    berserk: 0,
    autoLife: 0,
    trance: 0,
    xTrance: 0,
    offensiveSkill: bytes[0] % 4,
    supportiveSkill: (bytes[1] % 4) + 4,
    specialSkill: 8, // always shuffle
  }
}

export const applyDamage = (
  hero: Hero,
  physical = 0,
  magical = 0,
  ignoreArmor = false,
  ignoreShell = false,
) => {
  if (!ignoreArmor) {
    if (hero.armor < physical) {
      physical -= hero.armor
      hero.armor = 0
    } else {
      hero.armor -= physical
      physical = 0
    }
  }

  if (!ignoreShell) {
    if (hero.shell < magical) {
      magical -= hero.shell
      hero.shell = 0
    } else {
      hero.shell -= magical
      magical = 0
    }
  }

  hero.hp -= physical + magical

  return hero
}

export const addHp = (hero: Hero, amount: number) => {
  hero.hp += amount
  if (hero.hp > hero.maxHp) hero.hp = hero.maxHp
  return hero
}

export const absorbMana = (
  hero: Hero,
  absorbedMana: number[] /* [FIRE, WIND, WATR, EART] */,
) => {
  const bonus = Math.floor((hero.int - 1) / 3)
  absorbedMana = absorbedMana.map((m) => (m ? m + bonus : m))

  hero.fireMp = Math.min(hero.fireMp + absorbedMana[0], hero.maxMp)
  hero.windMp = Math.min(hero.windMp + absorbedMana[1], hero.maxMp)
  hero.watrMp = Math.min(hero.watrMp + absorbedMana[2], hero.maxMp)
  hero.eartMp = Math.min(hero.eartMp + absorbedMana[3], hero.maxMp)

  return hero
}

export const getNextTurn = (
  hero1: Hero,
  hero2: Hero,
  pubkey1: Uint8Array,
  pubkey2: Uint8Array,
  gameHash: Uint8Array,
) => {
  const turnPt1 = computeAttribute(HeroAttributes.SPD, hero1.spd).turnPoints!
  const turnPt2 = computeAttribute(HeroAttributes.SPD, hero2.spd).turnPoints!

  while (hero1.turnTime < 200 && hero2.turnTime < 200) {
    hero1.turnTime += turnPt1
    hero2.turnTime += turnPt2
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
        return { hero: hero1, pubkey: pubkey1 }
      } else if (seq1[i] < seq2[i]) {
        return { hero: hero2, pubkey: pubkey2 }
      }
    }

    // shouldn't reach this point, unless both hero 1 and hero 2 are the same
    throw new Error(
      'Heroes are too identical, even having the same public key hash result.',
    )
  } else if (hero1.turnTime >= 200) {
    return { hero: hero1, pubkey: pubkey1 }
  }

  return { hero: hero2, pubkey: pubkey2 }
}

export const skillCountPerMana = (mana: number[], costs: number[]) => {
  return mana.map((mp, i) => {
    if (typeof costs[i] === 'undefined') return undefined

    if (costs[i] === 0) {
      return mp >= 1 ? 1 : 0
    }

    return mp / costs[i]!
  })
}

export const isExecutable = (hero: Hero, costs: number[]) => {
  const count = skillCountPerMana(
    [hero.fireMp, hero.windMp, hero.watrMp, hero.eartMp],
    costs,
  )

  return count.every((n) => {
    if (typeof n === 'undefined') return true
    if (n >= 1) return true

    return false
  })
}

export const deductMana = (hero: Hero, cost: number[]) => {
  const [fire, wind, water, earth] = cost
  hero.fireMp -= fire === 0 ? hero.fireMp : fire ?? 0
  hero.windMp -= wind === 0 ? hero.windMp : wind ?? 0
  hero.watrMp -= water === 0 ? hero.watrMp : water ?? 0
  hero.eartMp -= earth === 0 ? hero.eartMp : earth ?? 0

  return hero
}

export const executableCommands = (
  originalHero: Hero,
  absorbedCommands: number[] /* [ATK, SUP, SPE] */,
) => {
  let hero = { ...originalHero } as Hero
  const flags = [false, false, false]
  const offensiveSkill = innateSkills[hero.offensiveSkill]
  const supportiveSkill = innateSkills[hero.supportiveSkill]
  const specialSkill = innateSkills[hero.specialSkill]
  const queue: {
    hero: Hero
    lvl?: number
    skill?: Skill
    attack?: number
    armor?: number
  }[] = []

  // priority: special skill > supportive skill > offensive skill

  // Special Skill requires to have 4 or more amulets to be executed
  if (absorbedCommands[2] > 3) {
    const costs = Array.from(specialSkill.code.slice(0, 4))
    if (isExecutable(hero, costs)) {
      queue.push({
        hero: { ...hero },
        skill: specialSkill,
      })
      hero = deductMana(hero, costs)
      flags[2] = true
    }
  }

  if (absorbedCommands[1] > 2) {
    const costs = Array.from(supportiveSkill.code.slice(0, 4))
    if (isExecutable(hero, costs)) {
      queue.push({
        hero: { ...hero },
        lvl: absorbedCommands[1] > 4 ? 3 : absorbedCommands[1] === 4 ? 2 : 1,
        skill: supportiveSkill,
      })
      hero = deductMana(hero, costs)
      flags[1] = true
    } else {
      queue.push({
        armor: absorbedCommands[1],
        hero: { ...hero },
      })
    }
  }

  if (absorbedCommands[0] > 2) {
    const costs = Array.from(supportiveSkill.code.slice(0, 4))
    if (isExecutable(hero, costs)) {
      queue.push({
        hero: { ...hero },
        lvl: absorbedCommands[0] > 4 ? 3 : absorbedCommands[0] === 4 ? 2 : 1,
        skill: offensiveSkill,
      })
      hero = deductMana(hero, costs)
      flags[0] = true
    } else {
      queue.push({
        attack: absorbedCommands[0],
        hero: { ...hero },
      })
    }
  }

  return {
    flags,
    queue,
  }
}

export function checkWinner(player: Hero, opponent: Hero) {
  // TODO: HP check after each command
  // win, lose, draw
}

export function hashToTiles(hash: Uint8Array): number[] {
  const tiles = new Array(64)

  for (let i = 0; i < 32; i++) {
    const byte = hash[i]
    tiles[i] = (byte & 0xf) % 7
    tiles[i + 32] = ((byte >> 4) & 0xf) % 7
  }

  return tiles
}

export function hasMatch(tiles: (number | null)[]) {
  for (let i = 0; i < 64; i++) {
    const type = tiles[i]
    const col = i % 8
    const row = Math.floor(i / 8)

    // vertical
    if (row < 6) {
      if (type !== null && type === tiles[i + 8] && type === tiles[i + 16]) {
        return true
      }
    }

    // horizontal
    if (col < 6) {
      if (type !== null && type === tiles[i + 1] && type === tiles[i + 2]) {
        return true
      }
    }
  }
  return false
}

export function getMatches(tiles: (number | null)[]) {
  const matches = new Array(64).fill(null)
  const count = new Array(7).fill(0)
  const depths = new Array(8).fill(0)

  for (let i = 0; i < 64; i++) {
    const type = tiles[i]
    const col = i % 8
    const row = Math.floor(i / 8)

    // vertical
    if (row < 6) {
      if (type !== null && type === tiles[i + 8] && type === tiles[i + 16]) {
        if (matches[i] === null) {
          depths[col]++
          count[type]++
          matches[i] = type
        }
        if (matches[i + 8] === null) {
          depths[col]++
          count[type]++
          matches[i + 8] = type
        }
        if (matches[i + 16] === null) {
          depths[col]++
          count[type]++
          matches[i + 16] = type
        }
      }
    }

    // horizontal
    if (col < 6) {
      if (type !== null && type === tiles[i + 1] && type === tiles[i + 2]) {
        if (matches[i] === null) {
          depths[col]++
          count[type]++
          matches[i] = type
        }
        if (matches[i + 1] === null) {
          depths[col + 1]++
          count[type]++
          matches[i + 1] = type
        }
        if (matches[i + 2] === null) {
          depths[col + 2]++
          count[type]++
          matches[i + 2] = type
        }
      }
    }
  }

  return {
    matches,
    depths,
    count,
  }
}

export function subtract(tiles: (number | null)[], mask: (number | null)[]) {
  const result = new Array(64).fill(null)

  for (let i = 0; i < 64; i++) {
    if (mask[i] === null) result[i] = tiles[i]
  }

  return result
}

export function applyGravity(tiles: (number | null)[], depths: number[]) {
  const gravityMap = new Array(64).fill(null)

  for (let i = 0; i < 8; i++) {
    if (depths[i] === 0) continue
    let gravity = 0
    let blanks = []
    for (let j = 7; j >= 0; j--) {
      const id = j * 8 + i
      if (tiles[id] === null) {
        gravity++
        blanks.push(id)
        continue
      }

      for (let k = 0; k < blanks.length; k++) {
        gravityMap[blanks[k]] = gravity + (gravityMap[blanks[k]] ?? 0)
      }
      blanks = []

      const node = tiles[id]
      const dest = (j + gravity) * 8 + i
      tiles[id] = null
      tiles[dest] = node
      gravityMap[id] = gravity
    }

    for (let k = 0; k < blanks.length; k++) {
      gravityMap[blanks[k]] = gravity + (gravityMap[blanks[k]] ?? 0)
    }
  }

  return {
    gravity: gravityMap,
    tiles: [...tiles],
  }
}

export function fill(
  tiles: (number | null)[],
  fillers: (number | null)[],
  depths: number[],
) {
  for (let i = 0; i < 8; i++) {
    if (depths[i] === 0) continue
    for (let j = 0; j < depths[i]; j++) {
      const id = j * 8 + i
      tiles[id] = fillers[id]
    }
  }

  return [...tiles]
}
