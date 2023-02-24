'use client'

import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PeerMessage, usePeer } from '@/atoms/peerAtom'
import { PeerMessages } from '@/enums/PeerMessages'
import { sleep } from '@/utils/sleep'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  gameFunctions,
  GameState,
  gameStateAtom,
  playerKpAtom,
} from '@/atoms/gameStateAtom'
import { GameStateFunctions } from '@/enums/GameStateFunctions'

export default function PeerConnectionManager() {
  const router = useRouter()
  const playerKp = useAtomValue(playerKpAtom)
  const [opponent] = useState(localStorage.getItem('demo_opponent') || null)
  const { isOpen, connections, messages, sendMessage } = usePeer(playerKp!)
  const gameFn = useSetAtom(gameFunctions)
  const [gameState, setGameState] = useAtom(gameStateAtom)

  const lastMessage = useRef<PeerMessage | null>(null)
  useEffect(() => {
    if (!isOpen) return
    if (
      messages.length > 0 &&
      lastMessage.current !== messages[messages.length - 1]
    ) {
      lastMessage.current = messages[messages.length - 1]
      const latestHash = gameState?.hashes[gameState.hashes.length - 1] ?? null

      switch (lastMessage.current.data.type) {
        case PeerMessages.GAME_TURN: {
          console.log('>>', latestHash, lastMessage.current.data)
          if (latestHash === lastMessage.current.data.latestHash) {
            gameFn(lastMessage.current.data.data)
            break
          }
        }
        case PeerMessages.REQUEST_GAME_STATE: {
          opponent &&
            sendMessage(opponent, {
              type: PeerMessages.RESPONSE_GAME_STATE,
              data: gameState,
            })
          break
        }
        case PeerMessages.RESPONSE_GAME_STATE: {
          const opponentGameState = lastMessage.current.data as GameState
          if (
            !gameState ||
            gameState.hashes.length < opponentGameState.hashes.length
          ) {
            setGameState(opponentGameState)
            gameFn({ type: GameStateFunctions.INIT })
          }
          break
        }
      }
    }
  }, [isOpen, messages, gameState, opponent, gameFn, sendMessage])

  useEffect(() => {
    if (!playerKp || !opponent) {
      sessionStorage.clear()
      router.push('/demo')
    }
  }, [playerKp, opponent])

  const retrying = useRef(false)
  useEffect(() => {
    if (!isOpen) return
    if (!gameState) return

    const opponentActive = connections.find((conn) => conn.peer === opponent)

    if (!opponentActive) {
      const ping = async () => {
        retrying.current = true
        while (retrying.current) {
          try {
            if (opponent) {
              await sendMessage(opponent, {
                type: PeerMessages.PING,
                latestHash: gameState.hashes[gameState.hashes.length - 1],
              })
            }
            retrying.current = false
          } catch (err: any) {
            if (err.type !== 'peer-unavailable') {
              retrying.current = false
              throw err
            }
          }

          await sleep(1000)
        }
      }
      !retrying.current && ping()
    }
  }, [isOpen, connections, opponent, gameState, sendMessage])

  return null
}
