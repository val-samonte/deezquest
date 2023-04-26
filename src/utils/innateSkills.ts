import { Skill } from '@/types/Skill'
import { SkillTypes } from '../enums/SkillTypes'

export const getOperationsFromCode = (codeStr: string) => {
  return new Uint8Array(codeStr.split(' ').map((n) => parseInt(n, 16)))
}

/**
 * Innate skills are the default skills derived from the mint address of the NFT
 */
export const innateSkills: Skill[] = [
  {
    name: 'Burning Punch',
    desc: 'Imbues bare fist with flames to incinerate enemies, enhancing base attack damage.',
    type: SkillTypes.ATTACK,
    cmdLvls: [
      '8 Magic Damage + Base Damage',
      '16 Magic Damage + Base Damage',
      '24 Magic Damage + Base Damage',
    ],
    code: getOperationsFromCode(
      '03 00 00 00 ' + // mana
        '43 01 00 ' + //  version
        '01 D0 08 ' + //  D0 = 8
        '37 D0 42 ' + //  D0 *= command level
        '35 D0 07 ' + //  D0 += base damage
        '43 21 25 D0', // apply damage D0
    ),
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
  },
  {
    name: 'Whip Kick',
    desc: 'Generates a powerful wave with a swift kick, dealing heavy magic damage.',
    type: SkillTypes.ATTACK,
    cmdLvls: ['10 Magic Damage', '20 Magic Damage', '30 Magic Damage'],
    code: getOperationsFromCode(
      '00 00 04 00 ' + // mana
        '43 01 00 ' + //  version
        '01 D0 0A ' + //  D0 = 10
        '37 D0 42 ' + //  D0 *= command level
        '43 21 25 D0', // apply damage D0
    ),
  },
  {
    name: 'Crushing Blow',
    desc: 'Deals a devastating strike, dealing damage based on earth mana of the hero.',
    type: SkillTypes.ATTACK,
    cmdLvls: [
      '1 Magic Damage × EarthMP',
      '2 Magic Damage × EarthMP',
      '3 Magic Damage × EarthMP',
    ],
    code: getOperationsFromCode(
      '00 00 00 FF ' + //   mana
        '43 01 00 ' + //    version
        '32 D0 42 0D ' + // D0 = command level * player.earthMp
        '43 21 25 D0', //   apply damage D0
    ),
  },
  {
    name: 'Focus',
    desc: 'Unleashes inner strength, increasing attack damage.',
    type: SkillTypes.SUPPORT,
    cmdLvls: ['+1 Base Damage', '+2 Base Damage', '+3 Base Damage'],
    code: getOperationsFromCode(
      '04 00 00 00 ' + // mana
        '00 ' + //        version
        '35 07 42', //    Base Damage += command level
    ),
  },
  {
    name: 'Tailwind',
    desc: 'Channels the wind to increase movement speed, allowing the hero to make turns more frequently.',
    type: SkillTypes.SUPPORT,
    cmdLvls: ['+1 Speed', '+2 Speed', '+3 Speed'],
    code: getOperationsFromCode(
      '00 04 00 00 ' + // mana
        '00 ' + //        version
        '35 0F 42', //    player.spd += command level
    ),
  },
  {
    name: 'First Aid',
    desc: 'Draws upon the natural healing properties of water, restores moderate amount of HP.',
    type: SkillTypes.SUPPORT,
    cmdLvls: ['+6 HP', '+8 HP', '+10 HP'],
    code: getOperationsFromCode(
      '00 00 03 00 ' + // mana
        '44 01 00 ' + //  versions
        '01 D0 02 ' + //  D0 = 2
        '01 D1 04 ' + //  D1 = 4
        '37 D0 42 ' + //  D0 *= command level
        '35 D0 D1 ' + //  D0 += D1
        '44 01 D0', //    player.hp += D0
    ),
  },
  {
    name: 'Harden',
    desc: 'Fortifies the hero with the strength of the earth, increasing defense.',
    type: SkillTypes.SUPPORT,
    cmdLvls: [
      '+2 Armor, +3 Magic Barrier',
      '+3 Armor, +4 Magic Barrier',
      '+4 Armor, +5 Magic Barrier',
    ],
    code: getOperationsFromCode(
      '00 00 00 03 ' + // mana
        '00 ' + //        version
        '01 D0 01 ' + //  D0 = 1
        '01 D1 02 ' + //  D1 = 2
        '35 D0 42 ' + //  D0 += command level
        '35 D1 42 ' + //  D1 += command level
        '35 04 D0 ' + //  player.armor += D0
        '35 05 D1', //    player.Magic Barrier += D1
    ),
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
  },
]
