import { SkillTypes } from '@/enums/SkillTypes'
import {
  aquaShot,
  manaWall,
  burningPunch,
  crushingBlow,
  extinguish,
  healing,
  combustion,
  empower,
  quake,
  swiftStrike,
  tailwind,
  tornado,
  SkillFn,
} from '@/utils/gameFunctions'
import { atom } from 'jotai'

export interface Skill {
  name: string
  desc: string
  type: SkillTypes
  cost: {
    fire?: number
    wind?: number
    water?: number
    earth?: number
  }
  fn: SkillFn
}

export const heroSkillsAtom = atom<Skill[]>(() => [
  {
    name: 'Burning Punch',
    desc: 'Deals ATTACK DMG + the gap between FIRE MANA of both heroes.',
    type: SkillTypes.OFFENSE,
    cost: {
      fire: 5,
    },
    fn: burningPunch,
  },
  {
    name: 'Swift Strike',
    desc: 'Deals 3|4|5 MAGIC DMG. Gains additional MAGIC DMG on LVL 3 based on the difference of SPD between the heroes.',
    type: SkillTypes.OFFENSE,
    cost: {
      wind: 3,
    },
    fn: swiftStrike,
  },
  {
    name: 'Aquashot',
    desc: 'Deals 2|6|8 MAGIC DMG. Gains additional MAGIC DMG on LVL 3 based on the difference of VIT between the heroes. LVL 3 ignores SHELL.',
    type: SkillTypes.OFFENSE,
    cost: {
      water: 4,
    },
    fn: aquaShot,
  },
  {
    name: 'Crushing Blow',
    desc: 'Deals 1 MAGIC DMG per EARTH MANA of the hero. LVL 3 deals current value of STR as ATTACK DMG. LVL 2|3 ignores SHELL.',
    type: SkillTypes.OFFENSE,
    cost: {
      earth: NaN,
    },
    fn: crushingBlow,
  },
  {
    name: 'Empower',
    desc: 'Adds 1|2|3 to ATTACK DMG during the match, stacks indefinitely.',
    type: SkillTypes.SUPPORT,
    cost: {
      fire: 5,
    },
    fn: empower,
  },
  {
    name: 'Tailwind',
    desc: 'Adds 1|2|3 to SPD during the match, stacks indefinitely.',
    type: SkillTypes.SUPPORT,
    cost: {
      wind: 3,
    },
    fn: tailwind,
  },
  {
    name: 'Healing',
    desc: 'Recover 3|4|5 HP. LVL 3 adds current value of VIT as HP.',
    type: SkillTypes.SUPPORT,
    cost: {
      water: 4,
    },
    fn: healing,
  },
  {
    name: 'Manawall',
    desc: 'Converts all EARTH MANA into SHELL. Gain ARMOR based on STR at LVL 2|3 if EARTH MANA converted is greater than 5.',
    type: SkillTypes.SUPPORT,
    cost: {
      earth: NaN,
    },
    fn: manaWall,
  },
  {
    name: 'Combustion',
    desc: 'Converts all WATER MANA in the board into FIRE MANA, deals MAGIC DMG on how many are converted.',
    type: SkillTypes.SPECIAL,
    cost: {
      fire: 6,
    },
    fn: combustion,
  },
  {
    name: 'Tornado',
    desc: 'Shuffles the board, deals MAGIC DMG based on how many WIND + EARTH MANA appear after the shuffle.',
    type: SkillTypes.SPECIAL,
    cost: {
      wind: 10,
    },
    fn: tornado,
  },
  {
    name: 'Extinguish',
    desc: 'Converts all FIRE MANA in the board into WATER MANA, recover HP based on how many are converted.',
    type: SkillTypes.SPECIAL,
    cost: {
      water: 6,
    },
    fn: extinguish,
  },
  {
    name: 'Quake',
    desc: "Deals 30 MAGIC DMG on both players. Damage is reduced based on each respective heroes' WIND MANA.",
    type: SkillTypes.SPECIAL,
    cost: {
      earth: 10,
    },
    fn: quake,
  },
])
