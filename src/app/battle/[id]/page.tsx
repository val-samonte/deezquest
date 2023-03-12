'use client'

import {
  gameFunctions,
  gameResultAtom,
  GameState,
  gameStateAtom,
} from '@/atoms/gameStateAtom'
import { matchAtom } from '@/atoms/matchAtom'
import {
  connectionListAtom,
  messagesAtom,
  peerAtom,
  PeerMessage,
} from '@/atoms/peerConnectionAtom'
import { GameStateFunctions } from '@/enums/GameStateFunctions'
import { MatchTypes } from '@/enums/MatchTypes'
import { PeerMessages } from '@/enums/PeerMessages'
import { sleep } from '@/utils/sleep'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

const Stage = dynamic(() => import('../Stage'), { ssr: false })

export default function BattleStagePage({
  params,
}: {
  params: { id: string }
}) {
  const match = useAtomValue(matchAtom)

  return (
    <div className='max-w-full max-h-full landscape:w-full landscape:aspect-[2/1] portrait:h-full portrait:aspect-[1/2] mx-auto'>
      {match?.matchType === MatchTypes.FRIENDLY && <FriendlyMatchManager />}
      <Stage />
    </div>
  )
}

function FriendlyMatchManager() {
  const router = useRouter()
  const peerInstance = useAtomValue(peerAtom)
  const messages = useAtomValue(messagesAtom)
  const connections = useAtomValue(connectionListAtom)
  const match = useAtomValue(matchAtom)
  const [gameState, setGameState] = useAtom(gameStateAtom)
  const gameFn = useSetAtom(gameFunctions)
  const setGameResult = useSetAtom(gameResultAtom)

  // Capture and process peer messages

  const lastMessage = useRef<PeerMessage | null>(null)
  useEffect(() => {
    if (!peerInstance || !match) return

    const opponentMessages = messages.filter(
      (m) => m.from === match.opponent.publicKey,
    )
    if (opponentMessages.length === 0) return

    const lastOpponentMessage = opponentMessages[opponentMessages.length - 1]
    if (lastMessage.current === lastOpponentMessage) {
      peerInstance.clearMessages(match.opponent.peerId ?? '')
      return
    }

    if (lastMessage.current !== lastOpponentMessage) {
      const message = lastOpponentMessage
      lastMessage.current = message

      if (!message) return

      const latestHash = gameState?.hashes[gameState.hashes.length - 1] ?? null

      switch (lastMessage.current.data.type) {
        case PeerMessages.GAME_TURN: {
          if (latestHash === lastMessage.current.data.latestHash) {
            gameFn(lastMessage.current.data.data)
            break
          }
          // NOTE OF THE LACK OF BREAK
        }
        case PeerMessages.PING: {
          if (latestHash === lastMessage.current.data.latestHash) {
            break
          }
          // NOTE OF THE LACK OF BREAK
        }
        case PeerMessages.REQUEST_GAME_STATE: {
          if (
            match.opponent.peerId &&
            latestHash !== lastMessage.current.data.latestHash
          ) {
            peerInstance.sendMessage(match.opponent.peerId, {
              type: PeerMessages.RESPONSE_GAME_STATE,
              data: gameState,
            })
          }
          break
        }
        case PeerMessages.RESPONSE_GAME_STATE: {
          const opponentGameState = lastMessage.current.data.data as GameState
          console.log('Parsing response game state', opponentGameState)
          if (
            !gameState?.hashes ||
            gameState.hashes.length < opponentGameState.hashes.length
          ) {
            setGameState(opponentGameState)
            gameFn({ type: GameStateFunctions.INIT })
          }
          break
        }
        case PeerMessages.REMATCH: {
          window.sessionStorage.clear()
          setGameState(null)
          setGameResult('')
          gameFn({
            type: GameStateFunctions.INIT,
          })
        }
      }
    }
  }, [
    peerInstance,
    messages,
    gameState,
    match,
    gameFn,
    setGameState,
    setGameResult,
  ])

  // Kick out of the arena when there's no pending match

  useEffect(() => {
    if (!match) {
      sessionStorage.clear()
      router.push('/battle')
    }
  }, [match])

  // Recon with opponent

  const retrying = useRef(false)
  useEffect(() => {
    if (!peerInstance || !match?.opponent.peerId || !gameState) return

    const opponentActive = connections.find(
      (conn) => conn.peer === match.opponent.peerId,
    )

    if (!opponentActive) {
      const ping = async () => {
        retrying.current = true
        while (retrying.current) {
          try {
            if (match.opponent.peerId) {
              await peerInstance.sendMessage(match.opponent.peerId, {
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
  }, [peerInstance, match, connections, gameState])

  // Checks opponent status

  const checkIntervalId = useRef<number>()
  useEffect(() => {
    if (!peerInstance || !match?.opponent.peerId || !gameState) return

    if (checkIntervalId.current) {
      window.clearInterval(checkIntervalId.current)
    }

    if (gameState.currentTurn === match.opponent.nft) {
      checkIntervalId.current = window.setInterval(() => {
        match.opponent.peerId &&
          peerInstance.sendMessage(match.opponent.peerId, {
            type: PeerMessages.REQUEST_GAME_STATE,
            latestHash: gameState.hashes[gameState.hashes.length - 1],
          })
      }, 10_000)
    }

    return () => {
      if (checkIntervalId.current) {
        window.clearInterval(checkIntervalId.current)
      }
    }
  }, [peerInstance, match, gameState])

  return null
}
