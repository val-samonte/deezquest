'use client'

import { gameFunctions, gameTransitionStackAtom } from '@/atoms/gameStateAtom'
import { isPortraitAtom, stageDimensionAtom } from '@/atoms/stageDimensionAtom'
import { useAtomValue, useSetAtom } from 'jotai'
import { Application, ICanvas, Texture } from 'pixi.js'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  AppContext,
  Container,
  Sprite,
  Stage as PixiStage,
} from 'react-pixi-fiber'
import StageCursor from './StageCursor'
import Tile from './Tile'

export default function Stage() {
  const gameFn = useSetAtom(gameFunctions)

  const transitionStack = useAtomValue(gameTransitionStackAtom)
  const [stackCounter, setStackCounter] = useState(-1)
  const [tiles, setTiles] = useState<any[]>([]) // TODO: refactor, let Tiles access this via atom

  useEffect(() => {
    if (transitionStack.length === 0) return

    let stack: any
    for (let i = 0; i < transitionStack.length; i++) {
      if (stackCounter < transitionStack[i].order) {
        stack = transitionStack[i]
        break
      }
    }

    if (!stack) return

    setTiles(
      stack.tiles.map((type: any, i: number) => {
        const props = {
          type,
          x: i % 8,
          y: Math.floor(i / 8),
        }

        if (stack.nodes?.[i]) {
          const transition = {
            id: stack.type,
            type: stack.nodes[i].type,
            duration: stack.duration,
            from: {
              x: stack.nodes[i].from.x,
              y: stack.nodes[i].from.y,
            },
          }

          return {
            ...props,
            transition,
          }
        }

        return props
      }),
    )

    setTimeout(() => {
      setStackCounter(stack.order)
    }, stack.duration + 100)
  }, [transitionStack, stackCounter])

  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current) return

    gameFn({
      type: 'initialBoard',
      data: { seed: Math.floor(Math.random() * 100000) + '' },
    })

    loaded.current = true
  }, [])

  return (
    <div className='w-full h-full flex portrait:flex-col'>
      <div className='flex-auto w-full p-3 sm:p-5 bg-black/80'></div>
      <div className='flex-none landscape:h-full portrait:w-full aspect-square flex items-center justify-center p-3 sm:p-5 backdrop-blur-sm '>
        <div className='landscape:h-full portrait:w-full aspect-square overflow-hidden '>
          <PixiStage options={{ backgroundAlpha: 0 }}>
            <AppContext.Consumer>
              {(app) => <PixiAppHandler app={app} />}
            </AppContext.Consumer>
            <Container>
              {tiles.map(
                (props, i) =>
                  props.type !== null && <Tile id={i} key={i} {...props} />,
              )}
            </Container>
            <Container>
              {tiles.map(
                (props, i) =>
                  props.type === null && <Tile id={i} key={i} {...props} />,
              )}
            </Container>
            <StageCursor />
          </PixiStage>
        </div>
      </div>
      <div className='flex-auto w-full p-3 sm:p-5 '></div>
    </div>
  )
}

function PixiAppHandler({ app }: { app: Application<ICanvas> }) {
  const setDimension = useSetAtom(stageDimensionAtom)
  const setPortrait = useSetAtom(isPortraitAtom)

  useLayoutEffect(() => {
    const resize = () => {
      const parent = app.view.parentNode as HTMLDivElement
      if (parent) {
        app.renderer.resize(parent.clientWidth, parent.clientHeight)
        setDimension({ width: parent.clientWidth, height: parent.clientHeight })
      }

      setPortrait(window.innerHeight >= window.innerWidth)
    }

    setTimeout(() => {
      resize()
    })

    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [])

  return null
}
