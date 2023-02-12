'use client'

import {
  gameTilesAtom,
  gameFunctions,
  gameTilesMatchesAtom,
} from '@/atoms/gameStateAtom'
import { useAtomValue, useSetAtom } from 'jotai'
import { Application, ICanvas, Texture } from 'pixi.js'
import { useLayoutEffect, useMemo, useState } from 'react'
import { AppContext, Sprite, Stage as PixiStage } from 'react-pixi-fiber'

export default function Stage() {
  const gameFn = useSetAtom(gameFunctions)
  const gameTiles = useAtomValue(gameTilesAtom)
  const gameTilesMatches = useAtomValue(gameTilesMatchesAtom)
  const [dimension, setDimension] = useState({ width: 0, height: 0 })

  const tiles = useMemo(() => {
    const tileSize = dimension.width / 8
    return gameTiles.map((type, i) => ({
      alpha: gameTilesMatches[i] === null ? 0.05 : 1,
      type: type ?? 0,
      x: (i % 8) * tileSize,
      y: Math.floor(i / 8) * tileSize,
      width: tileSize,
      height: tileSize,
    }))
  }, [dimension, gameTiles])

  return (
    <div className='w-full h-full flex portrait:flex-col'>
      <div className='flex-auto p-3 sm:p-5'>
        <button
          onClick={() => gameFn({ type: 'hashToBoard' })}
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
              <DummyTile key={i} {...props} />
            ))}
          </PixiStage>
        </div>
      </div>
      <div className='flex-auto'></div>
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
    resize()

    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [])

  return null
}

function DummyTile({ type, ...props }: any) {
  return <Sprite texture={Texture.from(`/sym_${type}.png`)} {...props} />
}
