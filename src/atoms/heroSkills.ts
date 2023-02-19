import { SkillTypes } from '@/enums/SkillTypes'
import {
  aquaShot,
  barrier,
  burningPunch,
  crushingBlow,
  extinguish,
  healing,
  combustion,
  enlighten,
  quake,
  swiftStrike,
  tailwind,
  tornado,
  CommandFn,
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
  fn: CommandFn
}

export const heroSkillsAtom = atom<Skill[]>(() => [
  {
    name: 'Burning Punch',
    desc: 'Deals normal attack damage + the gap between FIRE MANA of both heroes.',
    type: SkillTypes.OFFENSE,
    cost: {
      fire: 5,
    },
    fn: burningPunch,
  },
  {
    name: 'Swift Strike',
    desc: 'Deals 3|4|5 damage.',
    type: SkillTypes.OFFENSE,
    cost: {
      wind: 3,
    },
    fn: swiftStrike,
  },
  {
    name: 'Aquashot',
    desc: 'Deals 2|6|8 damage. LVL 3 ignores SHELL.',
    type: SkillTypes.OFFENSE,
    cost: {
      water: 4,
    },
    fn: aquaShot,
  },
  {
    name: 'Crushing Blow',
    desc: 'Deals 1 damage per EARTH MANA of the user. LVL 2|3 ignores SHELL.',
    type: SkillTypes.OFFENSE,
    cost: {
      earth: NaN,
    },
    fn: crushingBlow,
  },
  {
    name: 'Enlighten',
    desc: 'Adds 1|2|3 to normal attacks during the match, stacks indefinitely.',
    type: SkillTypes.SUPPORT,
    cost: {
      fire: 5,
    },
    fn: enlighten,
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
    desc: 'Recover 3|4|5 HP.',
    type: SkillTypes.SUPPORT,
    cost: {
      water: 4,
    },
    fn: healing,
  },
  {
    name: 'Barrier',
    desc: 'Converts all EARTH MANA into ARMOR. Gain 3|5 SHELL in LVL 2|3.',
    type: SkillTypes.SUPPORT,
    cost: {
      earth: NaN,
    },
    fn: barrier,
  },
  {
    name: 'Combustion',
    desc: 'Converts all WATER MANA in the board into FIRE MANA, deals damage on how many are converted.',
    type: SkillTypes.SPECIAL,
    cost: {
      fire: 5,
    },
    fn: combustion,
  },
  {
    name: 'Tornado',
    desc: 'Shuffles the board, deals damage based on how many WIND + EARTH MANA appears after the shuffle.',
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
      water: 5,
    },
    fn: extinguish,
  },
  {
    name: 'Quake',
    desc: "Deals 30 damage on both players. Damage is reduced based on each respective heroes' WIND MANA.",
    type: SkillTypes.SPECIAL,
    cost: {
      earth: 10,
    },
    fn: quake,
  },
])
