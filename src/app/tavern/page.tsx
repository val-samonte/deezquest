import Button from '@/components/Button'
import Center from '@/components/Center'
import PageContainer from '@/components/PageContainer'
import PageTitle from '@/components/PageTitle'
import Panel from '@/components/Panel'

export default function Pub() {
  return (
    <PageContainer>
      <PageTitle title='Tavern' />
      <Center>
        <Panel className='max-w-xs w-full'>
          <div className='p-5 flex flex-col'>
            <p className='py-5 mb-5 text-center'>Tavern is coming soon</p>
            <Button>Head to Barracks</Button>
          </div>
        </Panel>
      </Center>
    </PageContainer>
  )
}
