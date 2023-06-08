'use client'

import PageContainer from '@/components/PageContainer'
import PageTitle from '@/components/PageTitle'
import SkillIcon from '@/components/SkillIcon'
import { Hero, heroFromPublicKey } from '@/game/gameFunctions'
import { Skill } from '@/types/Skill'
import { innateSkills } from '@/utils/innateSkills'
import { Keypair } from '@solana/web3.js'
import classNames from 'classnames'
import Image from 'next/image'
import { useMemo } from 'react'
import useMeasure from 'react-use-measure'

export default function BattleLayout() {
  const hero1 = useMemo(() => {
    const hero = heroFromPublicKey(Keypair.generate().publicKey)
    hero.fireMp = Math.floor(Math.random() * hero.maxMp)
    hero.windMp = Math.floor(Math.random() * hero.maxMp)
    hero.watrMp = Math.floor(Math.random() * hero.maxMp)
    hero.eartMp = Math.floor(Math.random() * hero.maxMp)
    return hero
  }, [])
  const hero2 = useMemo(() => {
    const hero = heroFromPublicKey(Keypair.generate().publicKey)
    hero.fireMp = Math.floor(Math.random() * hero.maxMp)
    hero.windMp = Math.floor(Math.random() * hero.maxMp)
    hero.watrMp = Math.floor(Math.random() * hero.maxMp)
    hero.eartMp = Math.floor(Math.random() * hero.maxMp)
    return hero
  }, [])

  return (
    <PageContainer>
      <PageTitle title='Battle' />
      <div className='relative w-full h-full flex-auto'>
        <div
          className={classNames(
            'absolute inset-0 overflow-visible object-contain flex items-center',
            // 'bg-blue-900',
          )}
        >
          <div
            className={classNames(
              'pointer-events-none',
              'max-w-full max-h-full',
              'landscape:aspect-[2/1] w-full portrait:h-full',
            )}
          >
            <div
              className={classNames(
                'mx-auto',
                'landscape:aspect-[2/1] h-full',
                'landscape:grid grid-cols-12 grid-rows-6',
                'portrait:flex flex-col-reverse',
                // 'bg-green-700',
              )}
            >
              {/* Stage */}
              <div
                className={classNames(
                  'flex-shrink-0',
                  'col-span-6 row-span-6',
                  'col-start-4 row-start-1',
                )}
              >
                <div
                  className={classNames(
                    'aspect-square',
                    'landscape:h-full',
                    'portrait:w-screen',
                    'bg-red-500',
                  )}
                ></div>
              </div>
              {/* Player Cards */}
              <div
                className={classNames(
                  'flex-auto',
                  'col-span-12 row-span-6',
                  'col-start-1 row-start-1',
                  'grid grid-cols-12 grid-rows-6',
                )}
              >
                {/* Player */}
                <div
                  className={classNames(
                    'col-span-6 row-span-6',
                    'col-start-1 row-start-1',
                    'landscape:col-span-3 landscape:row-span-6',
                    'landscape:col-start-1 landscape:row-start-1',
                    // 'bg-amber-500',
                  )}
                >
                  <HeroCard hero={hero1} />
                </div>
                {/* Opponent */}
                <div
                  className={classNames(
                    'col-span-6 row-span-6',
                    'col-start-7 row-start-1',
                    'landscape:col-span-3 landscape:row-span-6',
                    'landscape:col-start-10 landscape:row-start-1',
                    // 'bg-orange-500',
                  )}
                >
                  <HeroCard hero={hero2} flip={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

// Note: portrait:xm is landscape
const mask =
  'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)'

function HeroCard({
  hero,
  className,
  flip,
}: {
  hero: Hero
  className?: string
  flip?: boolean
}) {
  const [ref, rect] = useMeasure()
  const expand = useMemo(() => rect.width * 2 <= rect.height, [rect])

  return (
    <div
      ref={ref}
      className={classNames(
        'w-full h-full flex flex-col',
        // 'bg-teal-700 portrait:xm:bg-green-500',
        className,
      )}
    >
      <div
        className='flex-auto -mb-20 portrait:xm:-mb-28 portrait:sm:-mb-40 overflow-hidden flex items-center justify-center relative'
        style={{
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      >
        <Image
          src={`${process.env.NEXT_PUBLIC_CDN}/enemy_goblin.png`}
          alt='Hero'
          fill={true}
          className={classNames(
            flip && '-scale-x-[100%]',
            'object-cover object-center',
          )}
        />
      </div>
      <div className='flex-none w-full relative flex flex-col gap-2 pb-3 px-2'>
        <HeroLifebar hero={hero} flip={flip} />
        <div
          className={classNames(
            'flex',
            expand
              ? 'flex-col'
              : [
                  'grid grid-cols-3',
                  // 'xm:-mt-2',
                  'gap-3 xm:gap-3 sm:gap-5 px-3 xm:px-5 sm:px-10',
                  flip ? 'xm:pr-20 sm:pr-24' : 'xm:pl-20 sm:pl-24',
                ],
          )}
        >
          <HeroSkill
            skill={innateSkills[hero.offensiveSkill]}
            flip={flip}
            expand={expand}
          />
          <HeroSkill
            skill={innateSkills[hero.supportiveSkill]}
            flip={flip}
            expand={expand}
          />
          <HeroSkill
            skill={innateSkills[hero.specialSkill]}
            flip={flip}
            expand={expand}
          />
        </div>
      </div>
    </div>
  )
}

function HeroLifebar({ hero, flip }: { hero: Hero; flip?: boolean }) {
  return (
    <div className='flex-none grid grid-cols-12 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold'>
      <div
        className={classNames(
          'col-span-4 portrait:xm:col-span-3 aspect-square p-2',
          flip
            ? 'col-start-9 portrait:xm:col-start-10 row-start-1'
            : 'col-start-1 portrait:xm:col-start-1 row-start-1',
          // 'bg-purple-500',
        )}
      >
        <div
          className={classNames(
            'w-full h-full grid grid-cols-2 grid-rows-2 rotate-45 text-white',
            'border border-amber-400/50',
            'p-px',
          )}
        >
          <HeroMana hero={hero} elemIndex={0} />
          <HeroMana hero={hero} elemIndex={1} />
          <HeroMana hero={hero} elemIndex={2} />
          <HeroMana hero={hero} elemIndex={3} />
        </div>
      </div>
      <div
        className={classNames(
          'col-span-8 portrait:xm:col-span-9 grid grid-rows-6 w-full h-full overflow-visible',
          flip ? 'pr-1 pl-2' : 'pr-2 pl-1',
        )}
      >
        <div
          className={classNames(
            'flex items-end relative',
            flip && 'flex-row-reverse',
            'row-span-2',
          )}
        >
          <span>255</span>
          <span>255</span>
          <span>255</span>
        </div>
        <div
          className={classNames(
            'row-span-1 w-full h-full bg-lime-500',
            // 'border-amber-400 border-b',
            flip ? 'skew-x-[-45deg]' : 'skew-x-[45deg]',
          )}
        ></div>
        <div
          className={classNames(
            'row-span-1 w-full h-full bg-pink-200',
            // 'border-amber-400 border-t',
            flip ? 'skew-x-[45deg]' : 'skew-x-[-45deg]',
          )}
        ></div>
        <div
          className={classNames(
            'flex items-start relative',
            flip && 'flex-row-reverse',
            'row-span-2',
          )}
        >
          <span>255</span>
          <span>255</span>
          <span>255</span>
        </div>
      </div>
    </div>
  )
}

function HeroMana({
  hero,
  elemIndex,
  className,
}: {
  hero: Hero
  elemIndex: number
  className?: string
}) {
  const bg = useMemo(
    () =>
      ['bg-fire-400', 'bg-wind-400', 'bg-water-400', 'bg-earth-400'][elemIndex],
    [elemIndex],
  )

  const mana = useMemo(
    () => [hero.fireMp, hero.windMp, hero.watrMp, hero.eartMp][elemIndex],
    [elemIndex],
  )

  const ratio = useMemo(() => mana / hero.maxMp, [hero.maxMp, mana])

  return (
    <div
      className={classNames(
        'relative overflow-hidden',
        'flex items-center justify-center bg-opacity-50',
        bg,
        className,
      )}
    >
      <div
        className={classNames(
          'absolute inset-0',
          'w-full h-full -rotate-45 scale-150',
        )}
      >
        <div
          className='bg-black/80 w-full'
          style={{ height: (1 - ratio) * 100 + '%' }}
        />
      </div>
      <span className='-rotate-45 mt-px ml-px text-center font-bold'>
        {mana}
      </span>
    </div>
  )
}

function HeroSkill({
  skill,
  flip,
  expand,
}: {
  skill: Skill
  flip?: boolean
  expand?: boolean
}) {
  if (expand) {
    return (
      <div className='grid grid-cols-12 px-2'>
        <div
          className={classNames(
            'flex items-center justify-center',
            'relative col-span-3 row-start-1 aspect-square p-2',
            // 'bg-pink-500',
            flip && 'col-start-10',
          )}
        >
          <div className='absolute inset-1 -rotate-45'>
            <div
              className={classNames(
                'absolute top-0 left-0 w-[30%] h-[30%]',
                'border-amber-400/50',
                !flip && 'border-t border-l',
              )}
            />
            <div
              className={classNames(
                'absolute bottom-0 right-0 w-[30%] h-[30%]',
                'border-amber-400/50',
                flip && 'border-b border-r',
              )}
            />
          </div>
          <SkillIcon skill={skill} flip={flip} className='scale-125' />
        </div>
        <div
          className={classNames(
            'flex flex-col justify-center -mx-1',
            'col-span-9 row-start-1 relative',
            flip ? 'col-start-1' : 'col-start-4',
          )}
        >
          <div className='w-full h-[50%]' />
          <div className='w-full border-b border-amber-400/50'></div>
          <div
            className={classNames(
              'w-full h-[50%] pt-1 pb-2 px-1',
              flip ? 'ml-1' : '-ml-1',
            )}
          >
            <div
              className={classNames(
                flip ? 'skew-x-[45deg]' : '-skew-x-[45deg]',
                'w-full h-full bg-white',
              )}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='h-full aspect-square'>
      <SkillIcon skill={skill} flip={flip} showCount />
    </div>
  )
}
