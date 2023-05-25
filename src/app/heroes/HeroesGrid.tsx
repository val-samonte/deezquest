import {
  gridContainerPosAtom,
  userNftCollectionAtom,
} from '@/atoms/barracksAtoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { HeroCard } from './HeroCard'
import { usePathname } from 'next/navigation'
import useMeasure from 'react-use-measure'

export default function HeroesGrid() {
  const setContainerPos = useSetAtom(gridContainerPosAtom)
  const collection = useAtomValue(userNftCollectionAtom)
  const pathname = usePathname()

  const [container, bounds] = useMeasure()

  useEffect(() => {
    setContainerPos(bounds)
  }, [bounds, setContainerPos])

  useLayoutEffect(() => {
    window.dispatchEvent(new Event('resize'))
    window.setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 300)
  }, [pathname])

  return (
    <div
      ref={container}
      className='flex flex-wrap justify-center gap-3 xl:gap-5 relative'
    >
      {collection.map((metadata, i) => (
        <HeroCard key={i} metadata={metadata} />
      ))}
    </div>
  )
}
