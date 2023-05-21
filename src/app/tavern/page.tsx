import Button from '@/components/Button'
import PageTitle from '@/components/PageTitle'
import Panel from '@/components/Panel'
import classNames from 'classnames'

export default function Pub() {
  return (
    <main className='h-full flex flex-col'>
      <PageTitle title='Tavern' />
      <div className='flex flex-auto items-center justify-center'>
        <Panel className='max-w-xs w-full'>
          <div className='p-5 flex flex-col'>
            <p className='py-5 mb-5 text-center'>Tavern is coming soon</p>
            <Button>Head to Barracks</Button>
          </div>
        </Panel>
      </div>
    </main>
  )
}
