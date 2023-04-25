import { Hero, skillCountPerMana } from '@/utils/gameFunctions'
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

      const maxUseCountPerElement = skillCountPerMana(
        [hero.maxMp, hero.maxMp, hero.maxMp, hero.maxMp],
        cost,
      ).map((e) => e && Math.floor(e))

      const elemSum = cost.reduce((sum, cur) => sum + cur, 0)
      const ratio = cost.map((e) => {
        if (typeof e === 'undefined') return undefined
        if (e === 0) return 1
        if (elemSum === 0) return 0
        return e / elemSum
      })

      return {
        useCount: Math.min(
          ...useCountPerElement
            .filter((n) => typeof n === 'number')
            .map((n) => Math.floor(n ?? 0)),
        ),
        maxUseCount: Math.min(
          ...maxUseCountPerElement
            .filter((n) => typeof n === 'number')
            .map((n) => n ?? 0),
        ),
        useCountPerElement,
        maxUseCountPerElement,
        ratio,
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
