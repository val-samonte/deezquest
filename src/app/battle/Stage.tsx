'use client'

import { gameFunctions, gameTransitionStackAtom } from '@/atoms/gameStateAtom'
import { GameTransitions } from '@/constants/GameTransitions'
import { useAtomValue, useSetAtom } from 'jotai'
// import dynamic from 'next/dynamic'
import { Application, ICanvas, Texture } from 'pixi.js'
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { AppContext, Sprite, Stage as PixiStage } from 'react-pixi-fiber'
import Tile from './Tile'

// const Tile = dynamic(() => import('./Tile'), { ssr: false })

export default function Stage() {
  const gameFn = useSetAtom(gameFunctions)

  const transitionStack = useAtomValue(gameTransitionStackAtom)
  const [stackCounter, setStackCounter] = useState(-1)
  const [tiles, setTiles] = useState<any[]>([])
  const [dimension, setDimension] = useState({ width: 0, height: 0 })
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(
    null,
  )
  const tileSize = useMemo(() => dimension.width / 8, [dimension])

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
        const props: any = {
          type,
          x: (i % 8) * tileSize,
          y: Math.floor(i / 8) * tileSize,
          width: tileSize,
          height: tileSize,
        }

        switch (stack.type) {
          case GameTransitions.SWAP: {
            if (stack.nodes[i]) {
              const transition = {
                id: GameTransitions.SWAP,
                duration: stack.duration,
                from: {
                  x: stack.nodes[i].from.x * tileSize,
                  y: stack.nodes[i].from.y * tileSize,
                },
              }

              return {
                ...props,
                transition,
              }
            }

            break
          }
        }

        return props
      }),
    )

    setTimeout(() => {
      setStackCounter(stack.order)
    }, stack.duration + 100)
  }, [tileSize, transitionStack, stackCounter])

  return (
    <div className='w-full h-full flex portrait:flex-col'>
      <div className='flex-auto w-full p-3 sm:p-5'>
        <button
          onClick={() =>
            gameFn({
              type: 'initialBoard',
              data: { seed: Math.floor(Math.random() * 100000) + '' },
            })
          }
          type='button'
          className='px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded'
        >
          Next Hash
        </button>
      </div>
      <div className='flex-none landscape:h-full portrait:w-full aspect-square flex items-center justify-center p-3 sm:p-5'>
        <div className='landscape:h-full portrait:w-full aspect-square bg-slate-300/10 rounded-xl overflow-hidden backdrop-blur-md'>
          <PixiStage options={{ backgroundAlpha: 0 }}>
            <AppContext.Consumer>
              {(app) => (
                <PixiAppHandler
                  app={app}
                  onResize={(width, height) => setDimension({ width, height })}
                />
              )}
            </AppContext.Consumer>
            {tiles.map((props, i) => (
              <Tile key={i} {...props} />
            ))}
            {cursorPos && (
              <Sprite
                texture={Texture.from(`/cursor.png`)}
                width={tileSize}
                height={tileSize}
                x={cursorPos.x * tileSize}
                y={cursorPos.y * tileSize}
              />
            )}
            <Sprite
              key={'pointer_capture'}
              interactive
              width={dimension.width}
              height={dimension.height}
              onpointerup={(e) => {
                const x = Math.floor(e.global.x / tileSize)
                const y = Math.floor(e.global.y / tileSize)
                let fired = 0 // TODO: BUG, setCursorPos firing twice

                setCursorPos((curr) => {
                  fired++
                  if (curr) {
                    const distX = Math.abs(curr.x - x)
                    const distY = Math.abs(curr.y - y)
                    if (distX + distY === 1) {
                      // swap
                      if (fired === 1) {
                        gameFn({
                          type: 'swapNode',
                          data: {
                            node1: { x: curr.x, y: curr.y },
                            node2: { x, y },
                          },
                        })
                      }
                      return null
                    }
                  }

                  if (!curr || !(curr.x === x && curr.y === y)) {
                    return {
                      x,
                      y,
                    }
                  }

                  return null
                })
              }}
            />
          </PixiStage>
        </div>
      </div>
      <div className='flex-auto w-full p-3 sm:p-5'></div>
    </div>
  )
}

function PixiAppHandler({
  app,
  onResize,
}: {
  app: Application<ICanvas>
  onResize: (w: number, h: number) => void
}) {
  useLayoutEffect(() => {
    const resize = () => {
      const parent = app.view.parentNode as HTMLDivElement
      if (parent) {
        app.renderer.resize(parent.clientWidth, parent.clientHeight)
        onResize(parent.clientWidth, parent.clientHeight)
      }
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
