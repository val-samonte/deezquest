import { Hero, skillCountPerMana, skills } from '@/utils/gameFunctions'
import { useMemo } from 'react'

export default function useUseCount(hero: Hero) {
  return useMemo(() => {
    return [
      skills[hero.offensiveSkill],
      skills[hero.supportiveSkill],
      skills[hero.specialSkill],
    ].map((skill) => {
      const useCountPerElement = skillCountPerMana(
        [hero.fireMp, hero.windMp, hero.watrMp, hero.eartMp],
        skill.cost,
      )

      const maxUseCountPerElement = skillCountPerMana(
        [hero.maxMp, hero.maxMp, hero.maxMp, hero.maxMp],
        skill.cost,
      ).map((e) => e && Math.floor(e))

      const { fire, wind, water, earth } = skill.cost
      const elem = [fire, wind, water, earth]
      const elemSum = (fire ?? 0) + (wind ?? 0) + (water ?? 0) + (earth ?? 0)
      const ratio = elem.map((e) => {
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
