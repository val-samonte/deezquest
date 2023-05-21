import Button from '@/components/Button'
import Center from '@/components/Center'
import PageContainer from '@/components/PageContainer'
import PageTitle from '@/components/PageTitle'
import Panel from '@/components/Panel'

export default function Tutorial() {
  return (
    <PageContainer>
      <PageTitle title='Tutorial' />
      <Center>
        <Panel className='max-w-xs w-full'>
          <div className='p-5 flex flex-col'>
            <p className='py-5 mb-5 text-center'>
              The library is under construction
            </p>
            <Button>Head to Barracks</Button>
          </div>
        </Panel>
      </Center>
    </PageContainer>
  )
}
