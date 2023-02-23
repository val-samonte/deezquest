import { SkillTypes } from '@/enums/SkillTypes'
import { TargetHero } from '@/enums/TargetHero'
import { PublicKey } from '@solana/web3.js'
import crypto from 'crypto'

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
  const bytes = publicKey.toBytes()

  return {
    hp: 100 + vit * 2,
    hpCap: 100 + vit * 2,
    armor: 0,
    shell: 0,
    turnTime: 0,
    baseDmg: 0,
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

  if (ignoreShell) {
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
  while (hero1.turnTime < 200 && hero2.turnTime < 200) {
    hero1.turnTime += hero1.spd + 5
    hero2.turnTime += hero2.spd + 5
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

export type SkillFn = (
  commandLevel: number,
  player: Hero,
  opponent: Hero,
  tiles: (number | null)[],
  gameHash: Uint8Array,
) => {
  player: Hero
  opponent: Hero
  tiles: (number | null)[]
  gameHash: Uint8Array
}

export const burningPunch: SkillFn = (
  commandLevel: number,
  player: Hero,
  opponent: Hero,
  tiles: (number | null)[],
  gameHash: Uint8Array,
) => {
  return { player, opponent, tiles, gameHash }
}

export const swiftStrike: SkillFn = (
  commandLevel: number,
  player: Hero,
  opponent: Hero,
  tiles: (number | null)[],
  gameHash: Uint8Array,
) => {
  return { player, opponent, tiles, gameHash }
}

export const aquaShot: SkillFn = (
  commandLevel: number,
  player: Hero,
  opponent: Hero,
  tiles: (number | null)[],
  gameHash: Uint8Array,
) => {
  return { player, opponent, tiles, gameHash }
}

export const crushingBlow: SkillFn = (
  commandLevel: number,
  player: Hero,
  opponent: Hero,
  tiles: (number | null)[],
  gameHash: Uint8Array,
) => {
  return { player, opponent, tiles, gameHash }
}

export const empower: SkillFn = (
  commandLevel: number,
  player: Hero,
  opponent: Hero,
  tiles: (number | null)[],
  gameHash: Uint8Array,
) => {
  return { player, opponent, tiles, gameHash }
}

export const tailwind: SkillFn = (
  commandLevel: number,
  player: Hero,
  opponent: Hero,
  tiles: (number | null)[],
  gameHash: Uint8Array,
) => {
  return { player, opponent, tiles, gameHash }
}

export const healing: SkillFn = (
  commandLevel: number,
  player: Hero,
  opponent: Hero,
  tiles: (number | null)[],
  gameHash: Uint8Array,
) => {
  return { player, opponent, tiles, gameHash }
}

export const manaWall: SkillFn = (
  commandLevel: number,
  player: Hero,
  opponent: Hero,
  tiles: (number | null)[],
  gameHash: Uint8Array,
) => {
  return { player, opponent, tiles, gameHash }
}

export const combustion: SkillFn = (
  commandLevel: number,
  player: Hero,
  opponent: Hero,
  tiles: (number | null)[],
  gameHash: Uint8Array,
) => {
  return { player, opponent, tiles, gameHash }
}

export const tornado: SkillFn = (
  commandLevel: number,
  player: Hero,
  opponent: Hero,
  tiles: (number | null)[],
  gameHash: Uint8Array,
) => {
  return { player, opponent, tiles, gameHash }
}

export const extinguish: SkillFn = (
  commandLevel: number,
  player: Hero,
  opponent: Hero,
  tiles: (number | null)[],
  gameHash: Uint8Array,
) => {
  return { player, opponent, tiles, gameHash }
}

export const quake: SkillFn = (
  commandLevel: number,
  player: Hero,
  opponent: Hero,
  tiles: (number | null)[],
  gameHash: Uint8Array,
) => {
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
    desc: 'Deals ATTACK DMG plus additional MAGIC DMG based on the gap of FIRE MANA between the heroes.',
    type: SkillTypes.OFFENSE,
    target: TargetHero.ENEMY,
    cost: {
      fire: 5,
    },
    fn: burningPunch,
  },
  {
    name: 'Swift Strike',
    desc: 'Deals 3|4|5 MAGIC DMG. Gains additional MAGIC DMG on LVL 3 based on the difference of SPD between the heroes.',
    type: SkillTypes.OFFENSE,
    target: TargetHero.ENEMY,
    cost: {
      wind: 3,
    },
    fn: swiftStrike,
  },
  {
    name: 'Aquashot',
    desc: 'Deals 2|6|8 MAGIC DMG. Gains additional MAGIC DMG on LVL 3 based on the difference of VIT between the heroes. LVL 3 pierces through SHELL.',
    type: SkillTypes.OFFENSE,
    target: TargetHero.ENEMY,
    cost: {
      water: 4,
    },
    fn: aquaShot,
  },
  {
    name: 'Crushing Blow',
    desc: 'Deals 1 MAGIC DMG per EARTH MANA of the hero. LVL 2|3 deals current value of STR as additional ATTACK DMG if EARTH MANA converted is greater than 5. LVL 3 destroys ARMOR after damage is applied.',
    type: SkillTypes.OFFENSE,
    target: TargetHero.ENEMY,
    cost: {
      earth: NaN,
    },
    fn: crushingBlow,
  },
  {
    name: 'Empower',
    desc: 'Adds 1|2|3 to ATTACK DMG during the match, stacks indefinitely.',
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
    desc: 'Recover 3|4|5 HP. LVL 3 adds current value of VIT as HP.',
    type: SkillTypes.SUPPORT,
    target: TargetHero.SELF,
    cost: {
      water: 4,
    },
    fn: healing,
  },
  {
    name: 'Manawall',
    desc: 'Converts all EARTH MANA into SHELL. Gain ARMOR based on STR at LVL 2|3 if EARTH MANA converted is greater than 5.',
    type: SkillTypes.SUPPORT,
    target: TargetHero.SELF,
    cost: {
      earth: NaN,
    },
    fn: manaWall,
  },
  {
    name: 'Combustion',
    desc: 'Converts all WATER MANA in the board into FIRE MANA, deals MAGIC DMG on how many are converted.',
    type: SkillTypes.SPECIAL,
    target: TargetHero.ENEMY,
    cost: {
      fire: 6,
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
    desc: 'Converts all FIRE MANA in the board into WATER MANA, recover HP based on how many are converted.',
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

export const isExecutable = (hero: Hero, cost: SkillCost) => {
  return (
    hero.fireMp >= (isNaN(cost.fire ?? 0) ? 0 : cost.fire ?? 0) &&
    hero.windMp >= (isNaN(cost.wind ?? 0) ? 0 : cost.wind ?? 0) &&
    hero.watrMp >= (isNaN(cost.water ?? 0) ? 0 : cost.water ?? 0) &&
    hero.eartMp >= (isNaN(cost.earth ?? 0) ? 0 : cost.earth ?? 0)
  )
}

export const deductMana = (hero: Hero, cost: SkillCost) => {
  hero.fireMp -= isNaN(cost.fire ?? 0) ? hero.fireMp : cost.fire ?? 0
  hero.windMp -= isNaN(cost.wind ?? 0) ? hero.windMp : cost.wind ?? 0
  hero.watrMp -= isNaN(cost.water ?? 0) ? hero.watrMp : cost.water ?? 0
  hero.eartMp -= isNaN(cost.earth ?? 0) ? hero.eartMp : cost.earth ?? 0

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
  const stacks: {
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
      stacks.push({
        hero: { ...hero },
        skill: specialSkill,
      })
      flags[2] = true
    }
  }

  if (absorbedCommands[1] > 2) {
    if (isExecutable(hero, supportiveSkill.cost)) {
      hero = deductMana(hero, supportiveSkill.cost)
      stacks.push({
        hero: { ...hero },
        lvl: absorbedCommands[1] > 4 ? 3 : absorbedCommands[1] === 4 ? 2 : 1,
        skill: supportiveSkill,
      })
      flags[1] = true
    } else {
      stacks.push({
        armor: absorbedCommands[1],
        hero: { ...hero },
      })
    }
  }

  if (absorbedCommands[0] > 2) {
    if (isExecutable(hero, offensiveSkill.cost)) {
      hero = deductMana(hero, offensiveSkill.cost)
      stacks.push({
        hero: { ...hero },
        lvl: absorbedCommands[0] > 4 ? 3 : absorbedCommands[0] === 4 ? 2 : 1,
        skill: offensiveSkill,
      })
      flags[0] = true
    } else {
      stacks.push({
        attack: absorbedCommands[0],
        hero: { ...hero },
      })
    }
  }

  return {
    flags,
    stacks,
  }
}
