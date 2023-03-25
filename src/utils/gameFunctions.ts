import { SkillTypes } from '@/enums/SkillTypes'
import { TargetHero } from '@/enums/TargetHero'
import { PublicKey } from '@solana/web3.js'
import crypto from 'crypto'
import { getNextHash } from './getNextHash'

export interface Hero {
  hp: number
  hpCap: number
  armor: number
  shell: number
  turnTime: number
  baseDmg: number
  fireMp: number
  fireMpCap: number
  windMp: number
  windMpCap: number
  watrMp: number
  watrMpCap: number
  eartMp: number
  eartMpCap: number
  int: number
  spd: number
  vit: number
  str: number
  weight: number
  offensiveSkill: number
  supportiveSkill: number
  specialSkill: number
}

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

export const heroFromPublicKey = (publicKey: string | PublicKey): Hero => {
  if (typeof publicKey === 'string') {
    publicKey = new PublicKey(publicKey)
  }

  const [int, spd, vit, str] = getHeroAttributes(publicKey)
  const hp = 80 + vit * 3 + Math.floor((vit - 1) / 3) * 5
  const bytes = publicKey.toBytes()

  return {
    hp,
    hpCap: hp,
    armor: 0,
    shell: 0,
    turnTime: 0,
    baseDmg: str,
    fireMp: 0,
    fireMpCap: 10 + int,
    windMp: 0,
    windMpCap: 10 + int,
    watrMp: 0,
    watrMpCap: 10 + int,
    eartMp: 0,
    eartMpCap: 10 + int,
    int: int,
    spd: spd,
    vit: vit,
    str: str,
    weight: 0,
    offensiveSkill: bytes[0] % 4,
    supportiveSkill: (bytes[1] % 4) + 4,
    specialSkill: (bytes[2] % 4) + 8,
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
  if (hero.hp > hero.hpCap) hero.hp = hero.hpCap
  return hero
}

export const absorbMana = (
  hero: Hero,
  absorbedMana: number[] /* [FIRE, WIND, WATR, EART] */,
) => {
  const bonus = Math.floor((hero.int - 1) / 3)
  absorbedMana = absorbedMana.map((m) => (m ? m + bonus : m))

  hero.fireMp += absorbedMana[0]
  hero.windMp += absorbedMana[1]
  hero.watrMp += absorbedMana[2]
  hero.eartMp += absorbedMana[3]

  if (hero.fireMp > hero.fireMpCap) hero.fireMp = hero.fireMpCap
  if (hero.windMp > hero.windMpCap) hero.windMp = hero.windMpCap
  if (hero.watrMp > hero.watrMpCap) hero.watrMp = hero.watrMpCap
  if (hero.eartMp > hero.eartMpCap) hero.eartMp = hero.eartMpCap

  return hero
}

export const getNextTurn = (
  hero1: Hero,
  hero2: Hero,
  pubkey1: Uint8Array,
  pubkey2: Uint8Array,
  gameHash: Uint8Array,
) => {
  const turnPt1 = Math.min(hero1.spd + 15, 50)
  const turnPt2 = Math.min(hero2.spd + 15, 50)

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

interface SkillFnParams {
  commandLevel: number
  player: Hero
  opponent: Hero
  tiles?: (number | null)[]
  gameHash?: Uint8Array
  preCommandHero?: Hero
  depths?: number[]
}

export type SkillFn = (params: SkillFnParams) => {
  player: Hero
  opponent: Hero
  tiles?: (number | null)[]
  gameHash?: Uint8Array
  depths?: number[]
}

export const burningPunch: SkillFn = ({
  commandLevel,
  player,
  opponent,
  tiles,
  gameHash,
  preCommandHero,
}) => {
  // Deals x2 of ATTACK DMG plus additional MAGIC DMG based on the gap of FIRE MANA between the heroes.
  // LVL 3 deals x2 of the mana gap instead.

  const atk = (player.baseDmg + commandLevel) * 2
  const mag = Math.abs((preCommandHero?.fireMp ?? 0) - opponent.fireMp)
  opponent = applyDamage(opponent, atk, mag * (commandLevel === 3 ? 2 : 1))

  return { player, opponent, tiles, gameHash }
}

export const swiftStrike: SkillFn = ({
  commandLevel,
  player,
  opponent,
  tiles,
  gameHash,
}) => {
  // Deals 6|8|10 MAGIC DMG.
  // Gains additional MAGIC DMG on LVL 3 based on the difference of SPD between the heroes.
  // LVL 3 stuns the opponent.

  let mag = [6, 8, 10][commandLevel - 1]
  if (commandLevel === 3) {
    mag += player.spd > opponent.spd ? player.spd - opponent.spd : 0
    opponent.turnTime -= 100
  }
  opponent = applyDamage(opponent, 0, mag)

  return { player, opponent, tiles, gameHash }
}

export const aquaShot: SkillFn = ({
  commandLevel,
  player,
  opponent,
  tiles,
  gameHash,
}) => {
  // Deals 4|12|16 MAGIC DMG.
  // Gains additional MAGIC DMG on LVL 3 based on the difference of VIT between the heroes.
  // LVL 3 pierces through SHELL.

  let mag = [4, 12, 16][commandLevel - 1]
  if (commandLevel === 3) {
    mag += player.vit > opponent.vit ? player.vit - opponent.vit : 0
  }
  opponent = applyDamage(opponent, 0, mag, false, commandLevel === 3)

  return { player, opponent, tiles, gameHash }
}

export const crushingBlow: SkillFn = ({
  commandLevel,
  player,
  opponent,
  tiles,
  gameHash,
  preCommandHero,
}) => {
  // Deals 2 MAGIC DMG per EARTH MANA of the hero.
  // LVL 2|3 deals current value of STR as additional ATTACK DMG if EARTH MANA converted is greater than 5.
  // LVL 3 destroys ARMOR after damage is applied.

  let mag = (preCommandHero?.eartMp ?? 1) * 2
  let atk = 0
  if (commandLevel > 1 && (preCommandHero?.eartMp ?? 0) >= 5) {
    atk = player.str
  }
  opponent = applyDamage(opponent, atk, mag)
  if (commandLevel === 3) {
    opponent.armor = 0
  }

  return { player, opponent, tiles, gameHash }
}

export const empower: SkillFn = ({
  commandLevel,
  player,
  opponent,
  tiles,
  gameHash,
}) => {
  // Adds 3|6|9 to ATTACK DMG during the match, stacks indefinitely.

  player.baseDmg += commandLevel * 3
  return { player: { ...player }, opponent, tiles, gameHash }
}

export const tailwind: SkillFn = ({
  commandLevel,
  player,
  opponent,
  tiles,
  gameHash,
}) => {
  // Adds 3|6|9 to SPD during the match, stacks indefinitely.

  player.spd += commandLevel
  return { player, opponent, tiles, gameHash }
}

export const healing: SkillFn = ({
  commandLevel,
  player,
  opponent,
  tiles,
  gameHash,
}) => {
  // Recover 6|8|10 HP.
  // LVL 3 adds x2 value of VIT as HP.

  let heal = [6, 8, 10][commandLevel - 1]

  if (commandLevel === 3) {
    heal += player.vit * 2
  }
  player = addHp(player, heal)
  return { player, opponent, tiles, gameHash }
}

export const manaWall: SkillFn = ({
  commandLevel,
  player,
  opponent,
  tiles,
  gameHash,
  preCommandHero,
}) => {
  // Converts all EARTH MANA into SHELL.
  // Gain ARMOR based on STR at LVL 2|3 if EARTH MANA converted is greater than 5.

  player.shell += preCommandHero?.eartMp ?? 1
  if (commandLevel > 1 && (preCommandHero?.eartMp ?? 0) >= 5) {
    player.armor += player.str
  }

  return { player, opponent, tiles, gameHash }
}

export const combustion: SkillFn = ({
  commandLevel,
  player,
  opponent,
  tiles,
  gameHash,
}) => {
  // Converts all WATER MANA in the board into FIRE MANA, deals x2 MAGIC DMG per each converted WATER MANA.
  if (!tiles) return { player, opponent, tiles, gameHash }

  let count = 0
  let newTiles = [...tiles]
  for (let i = 0; i < tiles.length; i++) {
    // [SWRD, SHLD, SPEC, FIRE, WIND, WATR, EART]
    if (tiles[i] === 5) {
      count++
      newTiles[i] = 3
    }
  }

  if (count === 0) return { player, opponent, tiles, gameHash }

  let mag = count * 2
  opponent = applyDamage(opponent, undefined, mag)

  return { player, opponent, tiles: newTiles, gameHash }
}

export const tornado: SkillFn = ({
  commandLevel,
  player,
  opponent,
  tiles,
  gameHash,
}) => {
  // Shuffles the board, deals MAGIC DMG based on how many WIND + EARTH MANA appear after the shuffle.
  if (!gameHash || !tiles) return { player, opponent, tiles, gameHash }

  const newHash = getNextHash([Buffer.from('SHUFFLE'), gameHash])
  const newTiles = hashToTiles(newHash) as (number | null)[]

  let count = 0
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] === null) {
      newTiles[i] = null
    } else if (tiles[i] === 4 || tiles[i] === 6) {
      // [SWRD, SHLD, SPEC, FIRE, WIND, WATR, EART]
      count++
    }
  }

  opponent = applyDamage(opponent, undefined, count)

  return { player, opponent, tiles: newTiles, gameHash: newHash }
}

export const extinguish: SkillFn = ({
  commandLevel,
  player,
  opponent,
  tiles,
  gameHash,
}) => {
  // Converts all FIRE MANA in the board into WATER MANA, recover 2 HP per each converted FIRE MANA.
  if (!tiles) return { player, opponent, tiles, gameHash }

  let count = 0
  let newTiles = [...tiles]
  for (let i = 0; i < tiles.length; i++) {
    // [SWRD, SHLD, SPEC, FIRE, WIND, WATR, EART]
    if (tiles[i] === 3) {
      count++
      newTiles[i] = 5
    }
  }

  if (count === 0) return { player, opponent, tiles, gameHash }

  let restoredHp = count * 2
  player = addHp(player, restoredHp)

  return { player, opponent, tiles: newTiles, gameHash }
}

export const quake: SkillFn = ({
  commandLevel,
  player,
  opponent,
  tiles,
  gameHash,
}) => {
  // Deals 30 MAGIC DMG on both players. Damage is reduced based on each respective heroes' WIND MANA.

  const playerDmg = Math.max(30 - player.windMp, 0)
  const opponentDmg = Math.max(30 - opponent.windMp, 0)

  player = applyDamage(player, undefined, playerDmg)
  opponent = applyDamage(opponent, undefined, opponentDmg)

  return { player, opponent, tiles, gameHash }
}

export interface SkillCost {
  fire?: number
  wind?: number
  water?: number
  earth?: number
}

export interface Skill {
  name: string
  desc: string
  type: SkillTypes
  cost: SkillCost
  target: TargetHero
  fn: SkillFn
}

export const skills: Skill[] = [
  {
    name: 'Burning Punch',
    desc:
      'Deals x2 of ATTACK DMG plus additional MAGIC DMG based on the gap of FIRE MANA between the heroes.\n' +
      'LVL 3 deals x2 of the mana gap instead.',
    type: SkillTypes.ATTACK,
    target: TargetHero.ENEMY,
    cost: {
      fire: 5,
    },
    fn: burningPunch,
  },
  {
    name: 'Swift Strike',
    desc:
      'Deals 6|8|10 MAGIC DMG.\n' +
      'Gains additional MAGIC DMG on LVL 3 based on the difference of SPD between the heroes.\n' +
      'LVL 3 stuns the opponent.',
    type: SkillTypes.ATTACK,
    target: TargetHero.ENEMY,
    cost: {
      wind: 3,
    },
    fn: swiftStrike,
  },
  {
    name: 'Aquashot',
    desc:
      'Deals 4|12|16 MAGIC DMG.\n' +
      'Gains additional MAGIC DMG on LVL 3 based on the difference of VIT between the heroes.\n' +
      'LVL 3 pierces through SHELL.',
    type: SkillTypes.ATTACK,
    target: TargetHero.ENEMY,
    cost: {
      water: 4,
    },
    fn: aquaShot,
  },
  {
    name: 'Crushing Blow',
    desc:
      'Deals 2 MAGIC DMG per EARTH MANA of the hero.\n' +
      'LVL 2|3 deals current value of STR as additional ATTACK DMG if EARTH MANA converted is greater than 5.\n' +
      'LVL 3 destroys ARMOR after damage is applied.',
    type: SkillTypes.ATTACK,
    target: TargetHero.ENEMY,
    cost: {
      earth: 0,
    },
    fn: crushingBlow,
  },
  {
    name: 'Empower',
    desc: 'Adds 3|6|9 to ATTACK DMG during the match, stacks indefinitely.',
    type: SkillTypes.SUPPORT,
    target: TargetHero.SELF,
    cost: {
      fire: 5,
    },
    fn: empower,
  },
  {
    name: 'Tailwind',
    desc: 'Adds 1|2|3 to SPD during the match, stacks indefinitely.',
    type: SkillTypes.SUPPORT,
    target: TargetHero.SELF,
    cost: {
      wind: 3,
    },
    fn: tailwind,
  },
  {
    name: 'Healing',
    desc: 'Recover 6|8|10 HP.\n' + 'LVL 3 adds x2 value of VIT as HP.',
    type: SkillTypes.SUPPORT,
    target: TargetHero.SELF,
    cost: {
      water: 4,
    },
    fn: healing,
  },
  {
    name: 'Manawall',
    desc:
      'Converts all EARTH MANA into SHELL.\n' +
      'Gain ARMOR based on STR at LVL 2|3 if EARTH MANA converted is greater than 5.',
    type: SkillTypes.SUPPORT,
    target: TargetHero.SELF,
    cost: {
      earth: 0,
    },
    fn: manaWall,
  },
  {
    name: 'Combustion',
    desc: 'Converts all WATER MANA in the board into FIRE MANA, deals x2 MAGIC DMG per each converted WATER MANA.',
    type: SkillTypes.SPECIAL,
    target: TargetHero.ENEMY,
    cost: {
      fire: 8,
    },
    fn: combustion,
  },
  {
    name: 'Tornado',
    desc: 'Shuffles the board, deals MAGIC DMG based on how many WIND + EARTH MANA appear after the shuffle.',
    type: SkillTypes.SPECIAL,
    target: TargetHero.ENEMY,
    cost: {
      wind: 10,
    },
    fn: tornado,
  },
  {
    name: 'Extinguish',
    desc: 'Converts all FIRE MANA in the board into WATER MANA, recover 2 HP per each converted FIRE MANA.',
    type: SkillTypes.SPECIAL,
    target: TargetHero.SELF,
    cost: {
      water: 6,
    },
    fn: extinguish,
  },
  {
    name: 'Quake',
    desc: "Deals 30 MAGIC DMG on both players. Damage is reduced based on each respective heroes' WIND MANA.",
    type: SkillTypes.SPECIAL,
    target: TargetHero.BOTH,
    cost: {
      earth: 10,
    },
    fn: quake,
  },
]

export const skillCountPerMana = (mana: number[], cost: SkillCost) => {
  const costs = [cost.fire, cost.wind, cost.water, cost.earth]

  return mana.map((mp, i) => {
    if (typeof costs[i] === 'undefined') return undefined

    if (costs[i] === 0) {
      return mp >= 1 ? 1 : 0
    }

    return mp / costs[i]!
  })
}

export const isExecutable = (hero: Hero, cost: SkillCost) => {
  const count = skillCountPerMana(
    [hero.fireMp, hero.windMp, hero.watrMp, hero.eartMp],
    cost,
  )

  return count.every((n) => {
    if (typeof n === 'undefined') return true
    if (n >= 1) return true

    return false
  })
}

export const deductMana = (hero: Hero, cost: SkillCost) => {
  hero.fireMp -= cost.fire === 0 ? hero.fireMp : cost.fire ?? 0
  hero.windMp -= cost.wind === 0 ? hero.windMp : cost.wind ?? 0
  hero.watrMp -= cost.water === 0 ? hero.watrMp : cost.water ?? 0
  hero.eartMp -= cost.earth === 0 ? hero.eartMp : cost.earth ?? 0

  return hero
}

export const executableCommands = (
  originalHero: Hero,
  absorbedCommands: number[] /* [ATK, SUP, SPE] */,
) => {
  let hero = { ...originalHero } as Hero
  const flags = [false, false, false]
  const offensiveSkill = skills[hero.offensiveSkill]
  const supportiveSkill = skills[hero.supportiveSkill]
  const specialSkill = skills[hero.specialSkill]
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
    if (isExecutable(hero, specialSkill.cost)) {
      hero = deductMana(hero, specialSkill.cost)
      queue.push({
        hero: { ...hero },
        skill: specialSkill,
      })
      flags[2] = true
    }
  }

  if (absorbedCommands[1] > 2) {
    if (isExecutable(hero, supportiveSkill.cost)) {
      hero = deductMana(hero, supportiveSkill.cost)
      queue.push({
        hero: { ...hero },
        lvl: absorbedCommands[1] > 4 ? 3 : absorbedCommands[1] === 4 ? 2 : 1,
        skill: supportiveSkill,
      })
      flags[1] = true
    } else {
      queue.push({
        armor: absorbedCommands[1],
        hero: { ...hero },
      })
    }
  }

  if (absorbedCommands[0] > 2) {
    if (isExecutable(hero, offensiveSkill.cost)) {
      hero = deductMana(hero, offensiveSkill.cost)
      queue.push({
        hero: { ...hero },
        lvl: absorbedCommands[0] > 4 ? 3 : absorbedCommands[0] === 4 ? 2 : 1,
        skill: offensiveSkill,
      })
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
