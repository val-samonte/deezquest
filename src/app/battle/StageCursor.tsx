import {
  gameFunctions,
  gameStateAtom,
  playerKpAtom,
} from '@/atoms/gameStateAtom'
import { stageDimensionAtom, tileSizeAtom } from '@/atoms/stageDimensionAtom'
import { GameStateFunctions } from '@/enums/GameStateFunctions'
import { useAtomValue, useSetAtom } from 'jotai'
import { FederatedPointerEvent, Texture } from 'pixi.js'
import { useCallback, useState } from 'react'
import { Sprite } from 'react-pixi-fiber/index.js'
import { PeerMessages } from '@/enums/PeerMessages'
import { peerAtom } from '@/atoms/peerConnectionAtom'

const cursorIcon = Texture.from(`/cursor.png`)

export default function StageCursor() {
  const playerKp = useAtomValue(playerKpAtom)
  // const { sendMessage } = usePeer(playerKp!)
  const peerInstance = useAtomValue(peerAtom)
  const [opponent] = useState(localStorage.getItem('demo_opponent') || null)
  const gameFn = useSetAtom(gameFunctions)
  const tileSize = useAtomValue(tileSizeAtom)
  const { width, height } = useAtomValue(stageDimensionAtom)
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(
    null,
  )
  const gameState = useAtomValue(gameStateAtom)

  const onPointerUp = useCallback(
    (e: FederatedPointerEvent) => {
      if (!gameState) return
      if (gameState.currentTurn !== playerKp?.publicKey.toBase58()) return

      const x = Math.floor(e.global.x / tileSize)
      const y = Math.floor(e.global.y / tileSize)
      let fired = 0 // TODO: BUG, setCursorPos firing twice

      setCursorPos((curr) => {
        fired++
        if (curr) {
          const distX = Math.abs(curr.x - x)
          const distY = Math.abs(curr.y - y)
          if (distX + distY === 1) {
            const origin = Math.min(curr.x, x) + Math.min(curr.y, y) * 8
            const dir = distX > distY ? 'h' : 'v'

            if (fired === 1) {
              const payload = {
                type: GameStateFunctions.SWAP_NODE,
                data: {
                  publicKey: playerKp?.publicKey.toBase58(),
                  origin: dir + origin,
                  node1: { x: curr.x, y: curr.y },
                  node2: { x, y },
                },
              }
              opponent &&
                peerInstance?.sendMessage(opponent, {
                  latestHash: gameState.hashes[gameState.hashes.length - 1],
                  type: PeerMessages.GAME_TURN,
                  data: payload,
                })
              gameFn(payload)
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
    },
    [tileSize, opponent, playerKp, gameState, peerInstance],
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
        onpointerup={onPointerUp}
      />
    </>
  )
}
