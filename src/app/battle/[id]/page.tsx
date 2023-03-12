import dynamic from 'next/dynamic'

const Stage = dynamic(() => import('../Stage'), { ssr: false })

export default function BattleStagePage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div className='max-w-full max-h-full landscape:w-full landscape:aspect-[2/1] portrait:h-full portrait:aspect-[1/2] mx-auto'>
      <Stage />
    </div>
  )
}
