'use client'

import {
  gameFunctions,
  gameResultAtom,
  GameState,
  gameStateAtom,
  gameTransitionQueueAtom,
} from '@/atoms/gameStateAtom'
import { Match, matchAtom } from '@/atoms/matchAtom'
import {
  connectionListAtom,
  messagesAtom,
  peerAtom,
  PeerMessage,
} from '@/atoms/peerConnectionAtom'
import { useUserWallet } from '@/atoms/userWalletAtom'
import WalletGuard from '@/components/WalletGuard'
import { GameStateFunctions } from '@/enums/GameStateFunctions'
import { MatchTypes } from '@/enums/MatchTypes'
import { PeerMessages } from '@/enums/PeerMessages'
import {
  findPossibleMoves,
  getBotMove,
  Move,
  toCoord,
  toIndex,
} from '@/game/bot'
import { sleep } from '@/utils/sleep'
import classNames from 'classnames'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { heroDisplayAtom } from '../PlayerCard'
import useUseCount from '../useUseCount'

const Stage = dynamic(() => import('../Stage'), { ssr: false })

export default function BattleStagePage({
  params,
}: {
  params: { id: string }
}) {
  const wallet = useUserWallet()
  const router = useRouter()
  const match = useAtomValue(matchAtom)
  const gameState = useAtomValue(gameStateAtom)

  useEffect(() => {
    let id: number
    if (!match) {
      id = window.setTimeout(() => {
        router.push('/battle')
      }, 1000)
    }
    return () => {
      if (id) {
        window.clearTimeout(id)
      }
    }
  }, [match])

  const turnsLeft = 100 - (gameState?.hashes.length ?? 0)

  if (!wallet?.connected) {
    return <WalletGuard />
  }

  return (
    <div className='max-w-full max-h-full landscape:w-full landscape:aspect-[2/1] portrait:h-full portrait:aspect-[1/2] mx-auto'>
      {match?.matchType === MatchTypes.FRIENDLY && (
        <FriendlyMatchManager match={match} />
      )}
      {match?.matchType === MatchTypes.BOT && <BotMatchManager match={match} />}
      <Stage />
      {turnsLeft < 50 && (
        <div
          className={classNames(
            'fixed bottom-0 inset-x-0 pointer-events-none py-3 z-20 flex items-center justify-center text-center',
          )}
        >
          <div
            className={classNames(
              turnsLeft < 10 ? 'text-red-600' : 'text-white',
              'flex flex-col items-center justify-center bg-black/50 rounded px-3',
            )}
          >
            <span className='font-bold text-4xl'>{turnsLeft}</span>
            <span className='text-xs opacity-50 font-bold uppercase'>
              turns left
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function FriendlyMatchManager({ match }: { match: Match }) {
  const router = useRouter()
  const peerInstance = useAtomValue(peerAtom)
  const messages = useAtomValue(messagesAtom)
  const connections = useAtomValue(connectionListAtom)
  const setMatch = useSetAtom(matchAtom)
  const [gameState, setGameState] = useAtom(gameStateAtom)
  const gameFn = useSetAtom(gameFunctions)
  const setGameResult = useSetAtom(gameResultAtom)
  const sendMessage = peerInstance?.sendMessage

  // Capture and process peer messages

  const lastMessage = useRef<PeerMessage | null>(null)
  useEffect(() => {
    if (!peerInstance || !match || !sendMessage) return

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

      switch (message.data.type) {
        case PeerMessages.GAME_TURN: {
          if (latestHash === message.data.latestHash) {
            gameFn(message.data.data)
            break
          }
          // NOTE OF THE LACK OF BREAK
        }
        case PeerMessages.PING: {
          if (latestHash === message.data.latestHash) {
            break
          }
          // NOTE OF THE LACK OF BREAK
        }
        case PeerMessages.REQUEST_GAME_STATE: {
          if (match.opponent.peerId && latestHash !== message.data.latestHash) {
            sendMessage(match.opponent.peerId, {
              type: PeerMessages.RESPONSE_GAME_STATE,
              data: gameState,
            })
          }
          break
        }
        case PeerMessages.RESPONSE_GAME_STATE: {
          const opponentGameState = message.data.data as GameState
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
          break
        }
        case PeerMessages.QUIT: {
          window.sessionStorage.clear()
          setGameState(null)
          setMatch(null)
          setGameResult('')
          router.push('/barracks')
          break
        }
      }
    }
  }, [
    router,
    peerInstance,
    messages,
    gameState,
    match,
    gameFn,
    sendMessage,
    setGameState,
    setGameResult,
    setMatch,
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

function BotMatchManager({ match }: { match: Match }) {
  const gameFn = useSetAtom(gameFunctions)
  const gameState = useAtomValue(gameStateAtom)
  const hero = useAtomValue(heroDisplayAtom(match.opponent.nft))
  const uses = useUseCount(hero)
  const transitionQueue = useAtomValue(gameTransitionQueueAtom)
  const isTransitioning = transitionQueue.length > 0

  useEffect(() => {
    if (isTransitioning) return
    if (!match) return
    if (!gameState) return
    if (match.opponent.nft !== gameState.currentTurn) return
    if (gameState.hashes.length >= 100) return

    gameFn(getBotMove(hero, uses, match, gameState))
  }, [match, isTransitioning, hero, uses, gameState, gameFn])

  return null
}
