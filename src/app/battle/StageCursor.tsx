import { gameFunctions, GameState, gameStateAtom } from '@/atoms/gameStateAtom'
import { stageDimensionAtom, tileSizeAtom } from '@/atoms/stageDimensionAtom'
import { GameStateFunctions } from '@/enums/GameStateFunctions'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { FederatedPointerEvent, Texture } from 'pixi.js'
import { useCallback, useState } from 'react'
import { Sprite } from 'react-pixi-fiber/index.js'
import { PeerMessages } from '@/enums/PeerMessages'
import { peerAtom } from '@/atoms/peerConnectionAtom'
import { Match, matchAtom } from '@/atoms/matchAtom'
import {
  CentralizedMatchResponse,
  TurnCentralizedMatchPayload,
  TurnCentralizedMatchPayloadPrevious,
} from '@/types/CentralizedMatch'
import canonicalize from 'canonicalize'
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { sign } from 'tweetnacl'
import { Keypair } from '@solana/web3.js'
import { botTurnsAtom, dappSignatureAtom } from '../barracks/SpecialDialogMatch'
import { MatchTypes } from '@/enums/MatchTypes'
import { burnerKeypairAtom } from '../BurnerAccountManager'

const cursorIcon = Texture.from(`/cursor.png`)

export default function StageCursor() {
  const burner = useAtomValue(burnerKeypairAtom)
  const match = useAtomValue(matchAtom)
  const peerInstance = useAtomValue(peerAtom)
  const gameFn = useSetAtom(gameFunctions)
  const tileSize = useAtomValue(tileSizeAtom)
  const { width, height } = useAtomValue(stageDimensionAtom)
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(
    null,
  )
  const gameState = useAtomValue(gameStateAtom)
  const [dappSignature, setDappSignature] = useAtom(dappSignatureAtom)
  const setBotTurns = useSetAtom(botTurnsAtom)

  const onPointerUp = useCallback(
    (e: FederatedPointerEvent) => {
      if (!gameState || !match) return
      if (gameState.currentTurn !== match.player.nft) return

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
                  publicKey: match.player.nft,
                  origin: dir + origin,
                  node1: { x: curr.x, y: curr.y },
                  node2: { x, y },
                },
              }
              match.opponent.peerId &&
                peerInstance?.sendMessage(match.opponent.peerId, {
                  latestHash: gameState.hashes[gameState.hashes.length - 1],
                  type: PeerMessages.GAME_TURN,
                  data: payload,
                })

              if (
                match.matchType === MatchTypes.CENTRALIZED &&
                dappSignature &&
                burner
              ) {
                const previous = reconstructPreviousResponse(
                  dappSignature,
                  JSON.parse(JSON.stringify(match)),
                  JSON.parse(JSON.stringify(gameState)),
                )

                centralizedMatchTurn(payload.data, burner, previous).then(
                  (result) => {
                    setDappSignature(result.dappSignature)
                    setBotTurns(result.botTurns ?? [])
                  },
                )
              }

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
    [
      dappSignature,
      tileSize,
      match,
      gameState,
      peerInstance,
      burner,
      setDappSignature,
      setBotTurns,
    ],
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

function reconstructPreviousResponse(
  dappSignature: string,
  match: Match,
  gameState: GameState,
): TurnCentralizedMatchPayloadPrevious {
  const [nonce, order, signature] = dappSignature.split('_')
  return {
    response: {
      nonce,
      order: parseInt(order),
      gameState,
      match,
    },
    signature,
  }
}

async function centralizedMatchTurn(
  data: any,
  burner: Keypair,
  previous: TurnCentralizedMatchPayloadPrevious,
) {
  const nonceResponse = await fetch('/api/request_nonce')
  const nonce = await nonceResponse.text()

  const payload = {
    data,
    nonce,
  }

  const playerSignature = bs58.encode(
    sign.detached(Buffer.from(canonicalize(payload) ?? ''), burner.secretKey),
  )

  const turnPayload: TurnCentralizedMatchPayload = {
    payload,
    signature: playerSignature,
    previous,
  }

  const turnResponse = await fetch('/api/centralized_match/turn', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(turnPayload),
  })

  const turnResult = (await turnResponse.json()) as CentralizedMatchResponse

  if (turnResult) {
    console.log(turnResult)
    window.localStorage.setItem('temp', JSON.stringify(turnResult))
  }

  return {
    dappSignature: [
      turnResult.response.nonce,
      turnResult.response.order,
      turnResult.signature,
    ].join('_'),
    botTurns: turnResult.botTurns,
    gameResult: turnResult.gameResult,
    newScore: turnResult.newScore,
  }
}
