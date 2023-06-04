import PageContainer from '@/components/PageContainer'
import PageTitle from '@/components/PageTitle'
import classNames from 'classnames'
import Image from 'next/image'

export default function BattleLayout() {
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
                  <HeroCard />
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
                  <HeroCard flip={true} />
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
  'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 90%, rgba(0,0,0,0) 100%)'

function HeroCard({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <div
      className={classNames(
        'w-full h-full flex flex-col',
        // 'bg-teal-700 portrait:xm:bg-green-500',
        className,
      )}
    >
      <div
        className='flex-auto -mb-5 portrait:xm:-mb-32 overflow-hidden flex items-center justify-center relative'
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
      <div className='flex-none w-full relative flex flex-col gap-2 pb-2 px-2'>
        <HeroLifebar flip={flip} />
        <div className='grid grid-cols-12 gap-2'>
          <HeroSkill flip={flip} />
          <HeroSkill flip={flip} />
          <HeroSkill flip={flip} />
        </div>
      </div>
    </div>
  )
}

function HeroLifebar({ flip }: { flip?: boolean }) {
  return (
    <div className='flex-none grid grid-cols-12 text-xs font-bold'>
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
            'border border-amber-400',
          )}
        >
          <div
            className={classNames(
              'bg-fire-400 flex items-center justify-center',
              'border border-amber-400',
            )}
          >
            <span className='-rotate-45'>99</span>
          </div>
          <div
            className={classNames(
              'bg-wind-400 flex items-center justify-center',
              'border border-amber-400',
            )}
          >
            <span className='-rotate-45'>99</span>
          </div>
          <div
            className={classNames(
              'bg-water-400 flex items-center justify-center',
              'border border-amber-400',
            )}
          >
            <span className='-rotate-45'>99</span>
          </div>
          <div
            className={classNames(
              'bg-earth-400 flex items-center justify-center',
              'border border-amber-400',
            )}
          >
            <span className='-rotate-45'>99</span>
          </div>
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

function HeroSkill({ flip }: { flip?: boolean }) {
  return (
    <div
      className={classNames(
        'col-span-4 xs:col-span-12 portrait:xm:col-span-4',
        'flex-none grid grid-cols-12 px-2',
        'portrait:xm:aspect-[5/3] portrait:xm:w-full',
      )}
    >
      <div
        className={classNames(
          'aspect-square portrait:xm:h-full',
          // 'portrait:xm:aspect-[3/1]',
          'col-span-3 row-start-1 portrait:xm:col-span-2 p-2',
          flip ? 'col-start-10 portrait:xm:col-start-11' : 'col-start-1',
          'bg-purple-500',
        )}
      ></div>
    </div>
  )
}
