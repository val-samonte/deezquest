'use client'

import StatCounter from '@/components/StatCounter'
import { Hero, heroFromPublicKey } from '@/utils/gameFunctions'
import classNames from 'classnames'
import { atom, useAtomValue } from 'jotai'
import { atomFamily } from 'jotai/utils'

export const heroDisplayAtom = atomFamily((pubkey: string) =>
  atom<Hero>(heroFromPublicKey(pubkey)),
)

export const updateHeroesAtom = atom(
  null,
  (get, set, update: { [key: string]: Hero }) => {
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

  return (
    <div
      className={classNames(
        'flex-auto w-full h-full bg-neutral-900 rounded',
        'flex landscape:flex-col overflow-hidden',
        asOpponent && 'portrait:flex-row-reverse',
      )}
    >
      <div className='bg-black/20 flex-1 overflow-hidden'>
        <div
          className={classNames(
            'bg-no-repeat bg-cover bg-center w-full h-full',
            asOpponent && 'scale-x-[-1]',
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
          <div className='flex flex-col items-center'>
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
              <div className='absolute inset-0 flex pointer-events-none'>
                <div
                  className='h-full'
                  style={{
                    width: '70%',
                    background:
                      'linear-gradient(180deg, rgba(5,131,0,0) 40%, rgba(5,131,0,0.15) 89%, rgba(5,131,0,1) 90%)',
                  }}
                ></div>
                <div
                  className='h-full'
                  style={{
                    width: '10%',
                    background:
                      'linear-gradient(180deg, rgba(55,236,214,0) 40%, rgba(55,236,214,0.15) 89%, rgba(55,236,214,1) 90%)',
                  }}
                ></div>
                <div
                  className='h-full'
                  style={{
                    width: '15%',
                    background:
                      'linear-gradient(180deg, rgba(208,21,255,0) 40%, rgba(208,21,255,0.15) 89%, rgba(208,21,255,1) 90%)',
                  }}
                ></div>
              </div>
              <span className='hidden xs:font-bold xl:flex whitespace-nowrap'>
                / {hero.hpCap}
              </span>
              <span className='mx-auto' />
              <StatCounter img='/armor.svg' value={hero.armor} />
              <StatCounter img='/shell.svg' value={hero.shell} />
            </div>
            <div
              className={classNames(
                'flex items-center gap-1 xl:gap-2 bg-neutral-400/5 p-1 xs:px-2',
                asOpponent && 'portrait:flex-row-reverse',
              )}
            >
              <span className='xl:hidden mx-auto' />
              <StatCounter img='/time.svg' value={hero.turnTime} />
              <span className='hidden xl:flex mx-auto' />
              <StatCounter img='/stat_spd.svg' value={hero.spd} />
            </div>
          </div>
        </div>

        {/* Mana */}
        <ul className='flex-none grid grid-cols-4 landscape:sm:grid-cols-2 px-2 gap-1 xl:gap-2'>
          <li className='flex items-center justify-center bg-neutral-400/5 p-1 xs:px-2'>
            <StatCounter img='/elem_fire.svg' value={hero.fireMp}>
              Fire
            </StatCounter>
          </li>
          <li className='flex items-center justify-center bg-neutral-400/5 p-1 xs:px-2'>
            <StatCounter img='/elem_wind.svg' value={hero.windMp}>
              Wind
            </StatCounter>
          </li>
          <li className='flex items-center justify-center bg-neutral-400/5 p-1 xs:px-2'>
            <StatCounter img='/elem_water.svg' value={hero.watrMp}>
              Water
            </StatCounter>
          </li>
          <li className='flex items-center justify-center bg-neutral-400/5 p-1 xs:px-2'>
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
