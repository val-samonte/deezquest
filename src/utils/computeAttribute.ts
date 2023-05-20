import { HeroAttributes } from '../enums/HeroAttributes'

export const computeAttribute = (attr: HeroAttributes, value: number) => {
  switch (attr) {
    case HeroAttributes.INT:
      return {
        totalMp: 10 + value,
        absorbMp: Math.floor((value - 1) / 3),
      }
    case HeroAttributes.SPD:
      return {
        turnPoints: Math.min(value + 15, 50),
      }
    case HeroAttributes.VIT:
      return {
        totalHp: 10 + value * 2 + Math.floor((value - 1) / 2) * 3,
      }
    case HeroAttributes.STR:
      return {
        baseDmg: Math.floor((value - 1) / 3),
        carryCap: value,
      }
  }
}
