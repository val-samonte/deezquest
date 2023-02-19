import dynamic from 'next/dynamic'

const HeroSelect = dynamic(() => import('./HeroSelect'), { ssr: false })

export default function Demo() {
  return <HeroSelect />
}
