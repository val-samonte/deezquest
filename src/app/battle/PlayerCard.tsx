'use client'

import { gameStateAtom } from '@/atoms/gameStateAtom'
import StatCounter from '@/components/StatCounter'
import { Hero, heroFromPublicKey } from '@/utils/gameFunctions'
import classNames from 'classnames'
import { atom, useAtomValue } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { useMemo } from 'react'

export const heroDisplayAtom = atomFamily((pubkey: string) =>
  atom<Hero>(heroFromPublicKey(pubkey)),
)

export const updateHeroesAtom = atom(
  null,
  (_, set, update: { [key: string]: Hero }) => {
    if (typeof update === 'object') {
      Object.entries(update).map(([pubkey, hero]) => {
        set(heroDisplayAtom(pubkey), hero)
      })
    }
  },
)

export default function PlayerCard({
  publicKey,
  asOpponent,
}: {
  publicKey: string
  asOpponent?: boolean
}) {
  const hero = useAtomValue(heroDisplayAtom(publicKey))
  const gameState = useAtomValue(gameStateAtom)

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
          ? 'text-pink-600'
          : '',
    }
  }, [hero.hp, hero.hpCap, hero.armor, hero.shell])

  const currentTurn = gameState?.currentTurn === publicKey

  return (
    <div
      className={classNames(
        'flex-auto w-full h-full bg-neutral-900 rounded',
        'flex landscape:flex-col overflow-hidden transition-all',
        asOpponent && 'portrait:flex-row-reverse',
        !currentTurn && 'brightness-90',
      )}
    >
      <div className='bg-black/20 flex-1 overflow-hidden'>
        <div
          className={classNames(
            'bg-no-repeat bg-cover bg-center w-full h-full',
            asOpponent && 'scale-x-[-1]',
            !currentTurn && 'brightness-50',
          )}
          style={{
            backgroundImage: `url("https://shdw-drive.genesysgo.net/52zh6ZjiUQ5UKCwLBwob2k1BC3KF2qhvsE7V4e8g2pmD/SolanaSpaceman.png")`,
          }}
        ></div>
      </div>
      <div className='flex-[2_2_0%] flex flex-col text-xs xs:text-sm lg:text-base xl:text-lg py-2 gap-1 xl:gap-2'>
        <div
          className={classNames(
            'flex-none flex px-2 gap-1 xl:gap-2',
            asOpponent && 'portrait:flex-row-reverse',
          )}
        >
          {/* HP */}
          <div className={classNames('flex flex-col items-center', highlight)}>
            <span className='text-3xl md:text-4xl xl:text-7xl xs:font-bold flex-none'>
              {hero.hp}
            </span>
            <span className='xs:font-bold xl:hidden whitespace-nowrap'>
              / {hero.hpCap}
            </span>
          </div>

          {/* HP Bar & Time */}
          <div className='flex flex-auto flex-col gap-1 xl:gap-2'>
            <div
              className={classNames(
                'relative flex items-center gap-1 xl:gap-2 bg-neutral-400/5 p-1 xs:px-2 ',
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
                      'linear-gradient(180deg, rgba(55,236,214,0) 40%, rgba(55,236,214,0.25) 89%, rgba(55,236,214,1) 90%)',
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
              <span className='mx-auto' />
              <StatCounter img='/armor.svg' value={hero.armor} />
              <StatCounter img='/shell.svg' value={hero.shell} />
            </div>
            <div
              className={classNames(
                'relative flex items-center gap-1 xl:gap-2 bg-neutral-400/5 p-1 xs:px-2',
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
              <StatCounter
                img='/time.svg'
                value={timeDisplay}
                className={timeDisplay < 0 ? 'text-red-500' : ''}
              />
              <span className='hidden xl:flex mx-auto' />
              <StatCounter img='/stat_spd.svg' value={hero.spd} />
            </div>
          </div>
        </div>

        {/* Mana */}
        <ul className='flex-none grid grid-cols-4 landscape:sm:grid-cols-2 px-2 gap-1 xl:gap-2'>
          <li className='relative flex items-center justify-center bg-neutral-400/5 p-1 xs:px-2'>
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
          <li className='relative flex items-center justify-center bg-neutral-400/5 p-1 xs:px-2'>
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
          <li className='relative flex items-center justify-center bg-neutral-400/5 p-1 xs:px-2'>
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
          <li className='relative flex items-center justify-center bg-neutral-400/5 p-1 xs:px-2'>
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
            <div className='relative w-1/3 h-full'>
              <div className='absolute inset-0 flex flex-col items-center justify-center'>
                <div className='xs:hidden'>
                  <StatCounter img='/cmd_attack.svg' value={1} />
                </div>
                <div className='hidden relative xs:flex flex-col w-full aspect-square items-center justify-center p-3'>
                  <img
                    src='/cmd_attack.svg'
                    className='w-full aspect-square '
                  />
                  <span className='xs:font-bold md:text-lg absolute bottom-0 xs:bottom-1 md:bottom-2 right-2 text-right'>
                    1
                  </span>
                </div>
              </div>
            </div>
            <div className='relative w-1/3 h-full'>
              <div className='absolute inset-0 flex flex-col items-center justify-center'>
                <div className='xs:hidden'>
                  <StatCounter img='/cmd_support.svg' value={1} />
                </div>
                <div className='hidden relative xs:flex flex-col w-full aspect-square items-center justify-center p-3'>
                  <img
                    src='/cmd_support.svg'
                    className='w-full aspect-square '
                  />
                  <span className='xs:font-bold md:text-lg absolute bottom-0 xs:bottom-1 md:bottom-2 right-2 text-right'>
                    1
                  </span>
                </div>
              </div>
            </div>
            <div className='relative w-1/3 h-full'>
              <div className='absolute inset-0 flex flex-col items-center justify-center '>
                <div className='xs:hidden'>
                  <StatCounter img='/cmd_special.svg' value={1} />
                </div>
                <div className='hidden relative xs:flex flex-col w-full aspect-square items-center justify-center p-3'>
                  <img
                    src='/cmd_special.svg'
                    className='w-full aspect-square '
                  />
                  <span className='xs:font-bold md:text-lg absolute bottom-0 xs:bottom-1 md:bottom-2 right-2 text-right'>
                    1
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
