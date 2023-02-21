'use client'

import StatCounter from '@/components/StatCounter'
import classNames from 'classnames'

export default function PlayerCard({
  asOpponent,
  publicKey,
}: {
  asOpponent?: boolean
  publicKey?: string
}) {
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
      <div className='flex-[2_2_0%] flex flex-col text-sm xl:text-base py-2 gap-1 xl:gap-2'>
        <div
          className={classNames(
            'flex-none flex px-2 gap-1 xl:gap-2',
            asOpponent && 'portrait:flex-row-reverse',
          )}
        >
          {/* HP */}
          <div className='flex flex-col items-center'>
            <span className='text-4xl xl:text-7xl font-bold flex-none'>
              100
            </span>
            <span className='font-bold xl:hidden'>/ 100</span>
          </div>

          {/* HP Bar & Time */}
          <div className='flex flex-auto flex-col gap-1 xl:gap-2'>
            <div
              className={classNames(
                'flex items-center gap-1 xl:gap-2 bg-neutral-400/5 px-2 py-1',
                asOpponent && 'portrait:flex-row-reverse',
              )}
            >
              <span className='hidden font-bold xl:flex'>/ 100</span>
              <span className='mx-auto' />
              <StatCounter img='/armor.svg' value={99} />
              <StatCounter img='/shell.svg' value={99} />
            </div>
            <div
              className={classNames(
                'flex items-center gap-1 xl:gap-2 bg-neutral-400/5 px-2 py-1',
                asOpponent && 'portrait:flex-row-reverse',
              )}
            >
              <span className='xl:hidden mx-auto' />
              <StatCounter img='/time.svg' value={99} />
              <span className='hidden xl:flex mx-auto' />
              <StatCounter img='/stat_spd.svg' value={99} />
            </div>
          </div>
        </div>

        {/* Mana */}
        <ul className='flex-none grid grid-cols-4 landscape:md:grid-cols-2 px-2 gap-1 xl:gap-2'>
          <li className='flex items-center justify-center bg-neutral-400/5 px-2 py-1'>
            <StatCounter img='/elem_fire.svg' value={99}>
              <span className='hidden landscape:md:flex'>Fire</span>
            </StatCounter>
          </li>
          <li className='flex items-center justify-center bg-neutral-400/5 px-2 py-1'>
            <StatCounter img='/elem_wind.svg' value={99} />
          </li>
          <li className='flex items-center justify-center bg-neutral-400/5 px-2 py-1'>
            <StatCounter img='/elem_water.svg' value={99} />
          </li>
          <li className='flex items-center justify-center bg-neutral-400/5 px-2 py-1'>
            <StatCounter img='/elem_earth.svg' value={99} />
          </li>
        </ul>

        {/* Skills */}
        <div className='relative h-full landscape:lg:hidden'>
          <div className='absolute inset-x-2 inset-y-0 flex'>
            <div className='relative w-1/3 h-full'>
              <div className='absolute inset-0 flex flex-col items-center justify-center'>
                <div className='xs:hidden bg-blue-800 animate-pulse px-2 rounded-full'>
                  <StatCounter img='/cmd_attack.svg' value={1} />
                </div>
                <div className='hidden relative xs:flex flex-col w-full aspect-square items-center justify-center p-3'>
                  <img
                    src='/cmd_attack.svg'
                    className='w-full aspect-square '
                  />
                  <span className='font-bold text-base absolute bottom-0 right-2 text-right'>
                    1
                  </span>
                </div>
              </div>
            </div>
            <div className='relative w-1/3 h-full'>
              <div className='absolute inset-0 flex flex-col items-center justify-center'>
                <div className='xs:hidden bg-blue-800 animate-pulse px-2 rounded-full'>
                  <StatCounter img='/cmd_support.svg' value={1} />
                </div>
                <div className='hidden relative xs:flex flex-col w-full aspect-square items-center justify-center p-3'>
                  <img
                    src='/cmd_support.svg'
                    className='w-full aspect-square '
                  />
                  <span className='font-bold text-base absolute bottom-0 right-2 text-right'>
                    1
                  </span>
                </div>
              </div>
            </div>
            <div className='relative w-1/3 h-full'>
              <div className='absolute inset-0 flex flex-col items-center justify-center '>
                <div className='xs:hidden bg-blue-800 animate-pulse px-2 rounded-full'>
                  <StatCounter img='/cmd_special.svg' value={1} />
                </div>
                <div className='hidden relative xs:flex flex-col w-full aspect-square items-center justify-center p-3'>
                  <img
                    src='/cmd_special.svg'
                    className='w-full aspect-square '
                  />
                  <span className='font-bold text-base absolute bottom-0 right-2 text-right'>
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
