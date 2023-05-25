import { HeroAttributes } from '../enums/HeroAttributes'

export const computeAttribute = (attr: HeroAttributes, value: number) => {
  switch (attr) {
    case HeroAttributes.INT:
      return {
        totalMp: 11 + value, // 110 at INT 99
        absorbMp: Math.floor((value - 1) / 3), // 32 at INT 99
      }
    case HeroAttributes.SPD:
      return {
        turnPoints: Math.min(Math.floor(value / 3) + 15, 50), // 48 at SPD 99
      }
    case HeroAttributes.VIT:
      return {
        totalHp: 9 + value * 2 + Math.floor((value - 1) / 6) * 3, // 255 at VIT 99
      }
    case HeroAttributes.STR:
      return {
        baseDmg: Math.floor((value - 1) / 3) + 1, // 33 at STR 99
        carryCap: value,
      }
  }
}
