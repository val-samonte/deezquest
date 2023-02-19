import { gameFunctions } from '@/atoms/gameStateAtom'
import { stageDimensionAtom, tileSizeAtom } from '@/atoms/stageDimensionAtom'
import { useAtomValue, useSetAtom } from 'jotai'
import { Texture } from 'pixi.js'
import { useState } from 'react'
import { Sprite } from 'react-pixi-fiber'

const cursorIcon = Texture.from(`/cursor.png`)

export default function StageCursor() {
  const gameFn = useSetAtom(gameFunctions)
  const tileSize = useAtomValue(tileSizeAtom)
  const { width, height } = useAtomValue(stageDimensionAtom)
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(
    null,
  )

  return (
    <>
      {cursorPos && (
        <Sprite
          texture={cursorIcon}
          width={tileSize}
          height={tileSize}
          x={cursorPos.x * tileSize}
          y={cursorPos.y * tileSize}
        />
      )}
      <Sprite
        key={'pointer_capture'}
        interactive
        width={width}
        height={height}
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
    </>
  )
}
