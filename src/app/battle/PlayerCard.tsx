'use client'

import { gameStateAtom, isGameTransitioningAtom } from '@/atoms/gameStateAtom'
import { Player } from '@/atoms/matchAtom'
import AnimatedCounter from '@/components/AnimatedCounter'
import SkillView from '@/components/SkillView'
import StatCounter from '@/components/StatCounter'
import {
  Hero,
  heroFromPublicKey,
  skillCountPerMana,
  skills,
} from '@/utils/gameFunctions'
import classNames from 'classnames'
import { atom, useAtomValue } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { useMemo } from 'react'
import HeroPortrait from './HeroPortrait'
import MiniSkillDisplay from './MiniSkillDisplay'

export const heroDisplayAtom = atomFamily((pubkey: string) =>
  atom<Hero>(heroFromPublicKey(pubkey)),
)

export const updateHeroesAtom = atom(
  null,
  (get, set, update?: { [key: string]: Hero }) => {
    Object.entries(
      typeof update === 'object' ? update : get(gameStateAtom)?.players ?? {},
    ).map(([pubkey, hero]) => {
      set(heroDisplayAtom(pubkey), hero)
    })
  },
)

export default function PlayerCard({
  player,
  asOpponent,
}: {
  player: Player
  asOpponent?: boolean
}) {
  const hero = useAtomValue(heroDisplayAtom(player.nft))
  const gameState = useAtomValue(gameStateAtom)
  const isTransitioning = useAtomValue(isGameTransitioningAtom)

  const timeDisplay = useMemo(
    () => (hero.turnTime > 200 ? 100 : hero.turnTime - 100),
    [hero.turnTime],
  )

  const { hp, armor, shell, highlight } = useMemo(() => {
    const effectiveHp = hero.hp + hero.armor + hero.shell
    const cap = effectiveHp > hero.hpCap ? effectiveHp : hero.hpCap

    return {
      hp: (hero.hp / cap) * 100 + '%',
      armor: (hero.armor / cap) * 100 + '%',
      shell: (hero.shell / cap) * 100 + '%',
      highlight:
        hero.armor > 0 && hero.shell
          ? 'text-amber-300'
          : hero.armor > 0
          ? 'text-cyan-400'
          : hero.shell > 0
          ? 'text-fuchsia-600'
          : '',
    }
  }, [hero.hp, hero.hpCap, hero.armor, hero.shell])

  const [offensive, supportive, special] = useMemo(() => {
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
        [hero.fireMpCap, hero.windMpCap, hero.watrMpCap, hero.eartMpCap],
        skill.cost,
      ).map((e) => e && Math.floor(e))

      const { fire, wind, water, earth } = skill.cost
      const elem = [fire, wind, water, earth]
      const elemSum = (fire ?? 0) + (wind ?? 0) + (water ?? 0) + (earth ?? 0)
      const ratio = elem.map((e) => {
        if (typeof e === 'undefined') return undefined
        if (e === 0) return 1
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
    hero.fireMp,
    hero.fireMpCap,
    hero.windMp,
    hero.windMpCap,
    hero.watrMp,
    hero.watrMpCap,
    hero.eartMp,
    hero.eartMpCap,
    hero.offensiveSkill,
    hero.supportiveSkill,
    hero.specialSkill,
  ])

  const currentTurn = gameState?.currentTurn === player.nft && !isTransitioning

  return (
    <div
      className={classNames(
        'flex-auto w-full h-full bg-neutral-900 rounded shadow-md',
        'flex landscape:flex-col transition-all',
        asOpponent && 'portrait:flex-row-reverse',
        // !currentTurn && 'brightness-90',
      )}
    >
      <div
        className={classNames(
          'bg-black/20 flex-1 flex items-center justify-center relative landscape:rounded-t',
          'overflow-hidden',
          asOpponent ? 'portrait:rounded-r' : 'portrait:rounded-l',
        )}
      >
        <HeroPortrait
          publicKey={player.nft}
          flip={asOpponent}
          spotlight={currentTurn}
        />
      </div>
      <div className='flex-[2_2_0%] flex flex-col text-xs xs:text-sm lg:text-base xl:text-lg py-2 gap-1 xl:gap-2'>
        <div
          className={classNames(
            'flex-none flex px-2 gap-1 xl:gap-2',
            asOpponent && 'portrait:flex-row-reverse',
          )}
        >
          {/* HP */}
          <div
            className={classNames(
              'flex flex-col items-center w-14 md:w-20 xl:w-36',
              highlight,
            )}
          >
            <AnimatedCounter
              className='text-3xl md:text-4xl xl:text-7xl xs:font-bold flex-none'
              value={Math.max(hero.hp, 0)}
            />
            <span className='xs:font-bold xl:hidden whitespace-nowrap'>
              / {hero.hpCap}
            </span>
          </div>

          {/* HP Bar & Time */}
          <div className={classNames('flex flex-auto flex-col gap-1 xl:gap-2')}>
            <div
              className={classNames(
                'relative flex items-center gap-1 xl:gap-2 bg-black/20 p-1 xs:px-2 ',
                asOpponent && 'portrait:flex-row-reverse',
              )}
            >
              <div
                className={classNames(
                  'absolute inset-0 flex pointer-events-none',
                  asOpponent && 'portrait:flex-row-reverse',
                )}
              >
                <div
                  className='h-full'
                  style={{
                    width: hp,
                    background:
                      'linear-gradient(180deg, rgba(15,236,0,0) 40%, rgba(15,236,0,0.25) 89%, rgba(15,236,0,1) 90%)',
                  }}
                />
                <div
                  className='h-full'
                  style={{
                    width: armor,
                    background:
                      'linear-gradient(180deg, rgba(55,186,214,0) 40%, rgba(55,186,214,0.25) 89%, rgba(55,186,214,1) 90%)',
                  }}
                />
                <div
                  className='h-full'
                  style={{
                    width: shell,
                    background:
                      'linear-gradient(180deg, rgba(208,21,255,0) 40%, rgba(208,21,255,0.25) 89%, rgba(208,21,255,1) 90%)',
                  }}
                />
              </div>
              <span
                className={classNames(
                  'hidden xs:font-bold xl:flex whitespace-nowrap',
                  highlight,
                )}
              >
                / {hero.hpCap}
              </span>
              <span className='mx-auto'></span>
              <StatCounter img='/armor.svg' value={hero.armor} />
              {hero.shell > 0 && (
                <StatCounter img='/shell.svg' value={hero.shell} />
              )}
            </div>
            <div
              className={classNames(
                'relative flex items-center gap-1 xl:gap-2 bg-black/20 p-1 xs:px-2',
                asOpponent && 'portrait:flex-row-reverse',
              )}
            >
              <div
                className={classNames(
                  'absolute inset-0 flex pointer-events-none',
                  asOpponent && 'portrait:flex-row-reverse',
                  timeDisplay !== 100
                    ? 'opacity-50'
                    : currentTurn
                    ? 'animate-pulse'
                    : '',
                )}
              >
                <div
                  className='h-full'
                  style={{
                    width: (timeDisplay < 0 ? 100 + timeDisplay : 0) + '%',
                  }}
                />
                <div
                  className='h-full'
                  style={{
                    width: (timeDisplay < 0 ? -timeDisplay : 0) + '%',
                    background:
                      'linear-gradient(180deg, rgba(255,65,65,0) 40%, rgba(255,65,65,0.25) 89%, rgba(255,65,65,1) 90%)',
                  }}
                />
                <div
                  className='h-full'
                  style={{
                    width: (timeDisplay > 0 ? timeDisplay : 0) + '%',
                    background:
                      'linear-gradient(180deg, rgba(255,189,241,0) 40%, rgba(255,189,241,0.25) 89%, rgba(255,189,241,1) 90%)',
                  }}
                />
              </div>
              <span className='xl:hidden mx-auto' />
              {currentTurn && !asOpponent ? (
                <span className='relative flex items-center md:gap-1'>
                  <img
                    src='/time.svg'
                    className={classNames(
                      'w-4 h-4 lg:w-6 lg:h-6 2xl:w-8 2xl:h-8 opacity-30',
                    )}
                  />
                  <span className='text-right font-bold ml-auto'>
                    <span className='hidden 2xl:inline'>Your</span> Turn
                  </span>
                </span>
              ) : (
                <StatCounter
                  img='/time.svg'
                  value={timeDisplay}
                  className={timeDisplay < 0 ? 'text-red-500' : ''}
                />
              )}
              <span className='hidden xl:flex mx-auto' />
              <StatCounter img='/stat_spd.svg' value={hero.spd} />
            </div>
          </div>
        </div>

        {/* Mana */}
        <ul className='flex-none grid grid-cols-4 landscape:sm:grid-cols-2 px-2 gap-1 xl:gap-2'>
          <li className='relative flex items-center justify-center bg-black/20 p-1 xs:px-2'>
            <div
              className={classNames(
                'absolute inset-0 flex pointer-events-none opacity-50',
                asOpponent && 'portrait:flex-row-reverse',
              )}
            >
              <div
                className='h-full'
                style={{
                  width: (hero.fireMp / hero.fireMpCap) * 100 + '%',
                  background:
                    'linear-gradient(180deg, rgba(246,0,0,0) 40%, rgba(246,0,0,0.25) 89%, rgba(246,0,0,1) 90%)',
                }}
              />
            </div>
            <StatCounter img='/elem_fire.svg' value={hero.fireMp}>
              Fire
            </StatCounter>
          </li>
          <li className='relative flex items-center justify-center bg-black/20 p-1 xs:px-2'>
            <div
              className={classNames(
                'absolute inset-0 flex pointer-events-none opacity-50',
                asOpponent && 'portrait:flex-row-reverse',
              )}
            >
              <div
                className='h-full'
                style={{
                  width: (hero.windMp / hero.windMpCap) * 100 + '%',
                  background:
                    'linear-gradient(180deg, rgba(35,220,31,0) 40%, rgba(35,220,31,0.25) 89%, rgba(35,220,31,1) 90%)',
                }}
              />
            </div>
            <StatCounter img='/elem_wind.svg' value={hero.windMp}>
              Wind
            </StatCounter>
          </li>
          <li className='relative flex items-center justify-center bg-black/20 p-1 xs:px-2'>
            <div
              className={classNames(
                'absolute inset-0 flex pointer-events-none opacity-50',
                asOpponent && 'portrait:flex-row-reverse',
              )}
            >
              <div
                className='h-full'
                style={{
                  width: (hero.watrMp / hero.watrMpCap) * 100 + '%',
                  background:
                    'linear-gradient(180deg, rgba(19,113,255,0) 40%, rgba(19,113,255,0.25) 89%, rgba(19,113,255,1) 90%)',
                }}
              />
            </div>
            <StatCounter img='/elem_water.svg' value={hero.watrMp}>
              Water
            </StatCounter>
          </li>
          <li className='relative flex items-center justify-center bg-black/20 p-1 xs:px-2'>
            <div
              className={classNames(
                'absolute inset-0 flex pointer-events-none opacity-50',
                asOpponent && 'portrait:flex-row-reverse',
              )}
            >
              <div
                className='h-full'
                style={{
                  width: (hero.eartMp / hero.eartMpCap) * 100 + '%',
                  background:
                    'linear-gradient(180deg, rgba(253,169,10,0) 40%, rgba(253,169,10,0.25) 89%, rgba(253,169,10,1) 90%)',
                }}
              />
            </div>
            <StatCounter img='/elem_earth.svg' value={hero.eartMp}>
              Earth
            </StatCounter>
          </li>
        </ul>

        {/* Skills */}
        <div className='relative h-full landscape:lg:hidden'>
          <div className='absolute inset-x-2 inset-y-0 flex'>
            <MiniSkillDisplay
              iconSrc='/cmd_attack.svg'
              useDetails={offensive}
              skill={skills[hero.offensiveSkill]}
            />
            <MiniSkillDisplay
              iconSrc='/cmd_support.svg'
              useDetails={supportive}
              skill={skills[hero.supportiveSkill]}
            />
            <MiniSkillDisplay
              iconSrc='/cmd_special.svg'
              useDetails={special}
              skill={skills[hero.specialSkill]}
            />
          </div>
        </div>

        <ul className='hidden lg:flex flex-col gap-5 flex-auto p-5'>
          <li className={classNames('flex flex-auto gap-5 h-8')}>
            <img
              src='/cmd_attack.svg'
              className={classNames(
                'aspect-square h-full',
                offensive.useCount === 0 && 'opacity-20',
              )}
            />
            <SkillView
              skill={skills[hero.offensiveSkill]}
              hideDesc
              useDetails={offensive}
            />
          </li>
          <li className={classNames('flex flex-auto gap-5 h-8')}>
            <img
              src='/cmd_support.svg'
              className={classNames(
                'aspect-square h-full',
                supportive.useCount === 0 && 'opacity-20',
              )}
            />
            <SkillView
              skill={skills[hero.supportiveSkill]}
              hideDesc
              useDetails={supportive}
            />
          </li>
          <li className={classNames('flex flex-auto gap-5 h-8')}>
            <img
              src='/cmd_special.svg'
              className={classNames(
                'aspect-square h-full',
                special.useCount === 0 && 'opacity-20',
              )}
            />
            <SkillView
              skill={skills[hero.specialSkill]}
              hideDesc
              useDetails={special}
            />
          </li>
        </ul>
      </div>
    </div>
  )
}
