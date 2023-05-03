import { Hero, skillCountPerMana } from '@/game/gameFunctions'
import { innateSkills } from '@/utils/innateSkills'
import { useMemo } from 'react'

export default function useUseCount(hero: Hero) {
  return useMemo(() => {
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
  }, [
    hero.maxMp,
    hero.fireMp,
    hero.windMp,
    hero.watrMp,
    hero.eartMp,
    hero.offensiveSkill,
    hero.supportiveSkill,
    hero.specialSkill,
  ])
}
