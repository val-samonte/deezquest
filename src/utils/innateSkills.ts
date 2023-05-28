import { Skill } from '@/types/Skill'
import { SkillTypes } from '../enums/SkillTypes'
import { Hero, skillCountPerMana } from '@/game/gameFunctions'

export const getOperationsFromCode = (codeStr: string) => {
  return new Uint8Array(codeStr.split(' ').map((n) => parseInt(n, 16)))
}

/**
 * Innate skills are the default skills derived from the mint address of the NFT
 */
export const innateSkills: Skill[] = [
  {
    name: 'Burning Punch',
    desc: 'Imbues bare fist with flames to incinerate enemies, consuming all fire mana as magical damage.',
    type: SkillTypes.ATTACK,
    cmdLvls: [
      '1 Magic Damage × Fire Mana',
      '2 Magic Damage × Fire Mana',
      '3 Magic Damage × Fire Mana',
    ],
    code: getOperationsFromCode(
      'FF 00 00 00 ' + //   mana
        '43 01 00 ' + //    version
        '32 D0 42 0A ' + // D0 = command level * player.fireMp
        '43 21 25 D0', //   apply damage D0
    ),
    icon: `${process.env.NEXT_PUBLIC_CDN}/skill_burningpunch.png`,
  },
  {
    name: 'Knifehand Strike',
    desc: 'Enhances hand strikes with cutting winds, dealing minor damage and delays the enemy.',
    type: SkillTypes.ATTACK,
    cmdLvls: [
      '6 Magic Damage, -60 Turn Time',
      '8 Magic Damage, -80 Turn Time',
      '10 Magic Damage, -100 Turn Time',
    ],
    code: getOperationsFromCode(
      '00 03 00 00 ' + //   mana
        '43 01 00 ' + //    version
        '01 D0 02 ' + //    D0 = 2
        '01 D1 04 ' + //    D1 = 4
        '01 D2 0A ' + //    D2 = 10
        '37 D0 42 ' + //    D0 *= command level
        '35 D0 D1 ' + //    D0 += D1
        '43 21 25 D0 ' + // apply damage D0
        '37 D0 D2 ' + //    D0 *= D2
        '36 26 D0', //      turnTime -= D0
    ),
    icon: `${process.env.NEXT_PUBLIC_CDN}/skill_knifehandstrike.png`,
  },
  {
    name: 'Whip Kick',
    desc: 'Generates a powerful wave with a swift kick, dealing heavy magic damage.',
    type: SkillTypes.ATTACK,
    cmdLvls: ['10 Magic Damage', '20 Magic Damage', '30 Magic Damage'],
    code: getOperationsFromCode(
      '00 00 07 00 ' + // mana
        '43 01 00 ' + //  version
        '01 D0 0A ' + //  D0 = 10
        '37 D0 42 ' + //  D0 *= command level
        '43 21 25 D0', // apply damage D0
    ),
    icon: `${process.env.NEXT_PUBLIC_CDN}/skill_whipkick.png`,
  },
  {
    name: 'Crushing Blow',
    desc: `Deals a devastating strike, enhanced with earth's magical power.`,
    type: SkillTypes.ATTACK,
    cmdLvls: [
      '8 Magic Damage + Attack Power',
      '16 Magic Damage + Attack Power',
      '24 Magic Damage + Attack Power',
    ],
    code: getOperationsFromCode(
      '00 00 00 05 ' + // mana
        '43 01 00 ' + //  version
        '01 D0 08 ' + //  D0 = 8
        '37 D0 42 ' + //  D0 *= command level
        '35 D0 07 ' + //  D0 += base damage
        '43 21 25 D0', // apply damage D0
    ),
    icon: `${process.env.NEXT_PUBLIC_CDN}/skill_crushingblow.png`,
  },
  {
    name: 'Meditate',
    desc: 'Harness the fiery energy of fire to enhance concentration, increasing intelligence.',
    type: SkillTypes.SUPPORT,
    cmdLvls: ['+1 Intelligence', '+2 Intelligence', '+3 Intelligence'],
    code: getOperationsFromCode(
      '03 00 00 00 ' + // mana
        '00 ' + //        version
        '35 0E 42', //    Base Damage += command level
    ),
    icon: `${process.env.NEXT_PUBLIC_CDN}/skill_focus.png`,
  },
  {
    name: 'Tailwind',
    desc: 'Channels the wind to increase movement speed, allowing the hero to make turns more frequently.',
    type: SkillTypes.SUPPORT,
    cmdLvls: ['+1 Turn Point', '+2 Turn Points', '+3 Turn Points'],
    code: getOperationsFromCode(
      '00 04 00 00 ' + // mana
        '00 ' + //        version
        '01 D0 03 ' + //  D0 = 3
        '37 D0 42 ' + //  D0 *= command level
        '35 0F D0', //    player.spd += D0
    ),
    icon: `${process.env.NEXT_PUBLIC_CDN}/skill_tailwind.png`,
  },
  {
    name: 'First Aid',
    desc: 'Draws upon the natural healing properties of water, restores moderate amount of HP.',
    type: SkillTypes.SUPPORT,
    cmdLvls: ['+6 HP', '+8 HP', '+10 HP'],
    code: getOperationsFromCode(
      '00 00 04 00 ' + // mana
        '44 01 00 ' + //  versions
        '01 D0 02 ' + //  D0 = 2
        '01 D1 04 ' + //  D1 = 4
        '37 D0 42 ' + //  D0 *= command level
        '35 D0 D1 ' + //  D0 += D1
        '44 01 D0', //    player.hp += D0
    ),
    icon: `${process.env.NEXT_PUBLIC_CDN}/skill_firstaid.png`,
  },
  {
    name: 'Harden',
    desc: 'Fortifies the hero with the strength of the earth, increasing both physical and magical defense.',
    type: SkillTypes.SUPPORT,
    cmdLvls: [
      '+5 Armor, +6 Magic Barrier',
      '+7 Armor, +8 Magic Barrier',
      '+9 Armor, +10 Magic Barrier',
    ],
    code: getOperationsFromCode(
      '00 00 00 06 ' + // mana
        '00 ' + //        version
        '01 C9 02 ' + //  C9 = 2
        '01 D0 03 ' + //  D0 = 3
        '01 D1 04 ' + //  D1 = 4
        '37 C9 42 ' + //  C9 *= command level
        '35 D0 C9 ' + //  D0 += C9
        '35 D1 C9 ' + //  D1 += C9
        '35 04 D0 ' + //  player.armor += D0
        '35 05 D1', //    player.shell += D1
    ),
    icon: `${process.env.NEXT_PUBLIC_CDN}/skill_harden.png`,
  },
  {
    name: 'Shuffle',
    desc: 'Masterful manipulation of elemental mana disrupts the battle field, potentially setting up powerful combos.',
    type: SkillTypes.SPECIAL,
    code: getOperationsFromCode(
      '02 02 02 02 ' + // mana
        '46 01 00 ' + //  version
        '46', //          shuffle
    ),
    cmdLvls: [undefined, 'Shuffle'],
    icon: `${process.env.NEXT_PUBLIC_CDN}/skill_shuffle.png`,
  },
]

export interface Uses {
  useCount: number
  maxUseCount: number
  useCountPerElement: (number | undefined)[]
  maxUseCountPerElement: (number | undefined)[]
  ratio: number[][]
  partitions: number
}

export function commandUseCount(hero: Hero) {
  return [
    innateSkills[hero.offensiveSkill],
    innateSkills[hero.supportiveSkill],
    innateSkills[hero.specialSkill],
  ].map((skill) => {
    const cost = Array.from(skill.code).slice(0, 4)

    const useCountPerElement = skillCountPerMana(
      [hero.fireMp, hero.windMp, hero.watrMp, hero.eartMp],
      cost,
    )

    const useCount = Math.min(
      ...useCountPerElement
        .filter((n) => typeof n === 'number')
        .map((n) => Math.floor(n ?? 0)),
    )

    // how many bars to display?
    const maxUseCountPerElement = skillCountPerMana(
      [hero.maxMp, hero.maxMp, hero.maxMp, hero.maxMp],
      cost,
    ).map((e) => e && Math.floor(e))
    const maxUseCount = Math.min(
      ...maxUseCountPerElement
        .filter((n) => typeof n === 'number')
        .map((n) => n ?? 0),
    )

    // how many partitions in a bar?
    const partitions = Math.max(
      cost.reduce((acc, cur) => (cur > 0 ? acc + 1 : acc), 0),
      0,
    )

    // what is the ratio of element per bar?
    const ratio = Array.from(Array(maxUseCount)).map((_, i) =>
      useCountPerElement.map((elem) => {
        const val = (elem ?? 0) - i
        if (val >= 1) {
          return 1 / partitions
        }
        if (val <= 0) {
          return 0
        }
        return val / partitions
      }),
    )

    return {
      useCount,
      maxUseCount,
      useCountPerElement,
      maxUseCountPerElement,
      ratio,
      partitions,
    }
  })
}
