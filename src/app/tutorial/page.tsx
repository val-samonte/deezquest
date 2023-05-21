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
        <Panel className='max-w-xs'>
          <div className='overflow-auto h-full relative'>
            <p className='px-5 my-5 text-center'>
              The library is under construction
            </p>
            <div className='p-5 flex justify-center sticky bottom-0'>
              <Button>Head to Barracks</Button>
            </div>
          </div>
        </Panel>
      </Center>
    </PageContainer>
  )
}
