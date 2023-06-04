import PageContainer from '@/components/PageContainer'
import PageTitle from '@/components/PageTitle'
import classNames from 'classnames'

export default function BattleLayout() {
  return (
    <PageContainer>
      <PageTitle title='Battle' />
      <div
        className={classNames(
          'relative overflow-visible object-contain w-full h-full flex-auto flex items-center',
          'bg-blue-900',
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
              'portrait:flex flex-col',
              // 'bg-green-700',
            )}
          >
            {/* Player Cards */}
            <div
              className={classNames(
                'portrait:xm:flex-auto',
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
                  'bg-amber-500',
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
                  'bg-orange-500',
                )}
              >
                <HeroCard />
              </div>
            </div>
            {/* Stage */}
            <div
              className={classNames(
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
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

// Note: portrait:xm is landscape

function HeroCard({ className }: { className?: string }) {
  return (
    <div className={classNames('w-full portrait:xm:bg-green-500', className)}>
      {/* Picture and health bar, armor, shell */}
      <div className='grid grid-cols-6'>
        <div className='col-span-2 aspect-square bg-purple-500'></div>
      </div>
      <div className='grid grid-cols-6'></div>
    </div>
  )
}
