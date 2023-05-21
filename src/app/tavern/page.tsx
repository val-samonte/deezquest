import Button from '@/components/Button'
import Center from '@/components/Center'
import PageContainer from '@/components/PageContainer'
import PageTitle from '@/components/PageTitle'
import Panel from '@/components/Panel'

export default function Tavern() {
  return (
    <PageContainer>
      <PageTitle title='Tavern' />
      <Center>
        <Panel className='max-w-xs w-full'>
          <div className='overflow-auto h-full relative'>
            <p className='px-5 my-5 text-center'>Tavern is currently closed</p>
            <div className='p-5 flex justify-center sticky bottom-0'>
              <Button>Head to Barracks</Button>
            </div>
          </div>
        </Panel>
      </Center>
    </PageContainer>
  )
}
