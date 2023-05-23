import {
  gridContainerPosAtom,
  userNftCollectionAtom,
} from '@/atoms/barracksAtoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import { HeroCard } from './HeroCard'

// hide grid (sm:portrait)
// padding-right: 100%
// margin-left: -100%

// not expanded
// pr-5
// panel: margin-right: -100%

// expanded
// pr-96
// panel: margin-right: 0

export default function HeroesGrid() {
  const setContainerPos = useSetAtom(gridContainerPosAtom)
  const collection = useAtomValue(userNftCollectionAtom)

  const container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onResize = () => {
      setContainerPos((pos) => {
        if (container.current) {
          const pos = container.current.getBoundingClientRect()
          const newPos = {
            x: pos.left,
            y: pos.top,
          }

          return newPos
        }
        return pos
      })
    }
    window.addEventListener('resize', onResize)

    const intId = window.setInterval(() => {
      if (container.current) {
        onResize()
        window.clearInterval(intId)
      }
    })

    return () => {
      window.removeEventListener('resize', onResize)
      window.clearInterval(intId)
    }
  }, [setContainerPos])
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
