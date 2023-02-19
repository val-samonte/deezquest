import dynamic from 'next/dynamic'

const HeroSelect = dynamic(() => import('./HeroSelect'), { ssr: false })

export default function Demo() {
  return (
    <div className='p-10'>
      <HeroSelect />
    </div>
  )
}
