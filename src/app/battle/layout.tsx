import PageContainer from '@/components/PageContainer'
import PageTitle from '@/components/PageTitle'
import classNames from 'classnames'

export default function BattleLayout() {
  return (
    <PageContainer>
      <PageTitle title='Battle' />
      <div className='relative overflow-visible object-contain w-full h-full flex-auto flex items-center bg-blue-900'>
        <div
          className={classNames(
            'max-w-full max-h-full',
            'landscape:aspect-[2/1] w-full portrait:h-full',
          )}
        >
          <div
            className={classNames(
              'mx-auto bg-green-700',
              'landscape:aspect-[2/1] h-full',
            )}
          ></div>
        </div>
      </div>
    </PageContainer>
  )
}
