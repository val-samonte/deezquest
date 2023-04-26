'use client'

import {
  gameFunctions,
  gameResultAtom,
  GameState,
  gameStateAtom,
  isGameTransitioningAtom,
} from '@/atoms/gameStateAtom'
import { BotMatch, FriendlyMatch, matchAtom } from '@/atoms/matchAtom'
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

function FriendlyMatchManager({ match }: { match: FriendlyMatch }) {
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

type Move = {
  origin: number
  dir: 'v' | 'h'
  points: number[]
}

function toCoord(index: number): [number, number] {
  return [index % 8, Math.floor(index / 8)]
}

function toIndex(x: number, y: number): number {
  return y * 8 + x
}

function findPossibleMoves(tiles: number[]): Move[] {
  const moves: Move[] = []

  for (let i = 0; i < 64; i++) {
    const [x, y] = toCoord(i)

    // horizontal swap check
    if (x < 7) {
      let hasMatch = false
      const points = [0, 0, 0, 0, 0, 0, 0]
      const a = { x, y }
      const b = { x: a.x + 1, y: a.y }

      const board = [...tiles]
      const swap = board[i]
      board[i] = board[toIndex(b.x, b.y)]
      board[toIndex(b.x, b.y)] = swap

      const aSym = board[i]
      const bSym = board[toIndex(b.x, b.y)]

      // top
      if (
        a.y > 1 &&
        aSym === board[toIndex(a.x, a.y - 1)] &&
        aSym === board[toIndex(a.x, a.y - 2)]
      ) {
        hasMatch = true
        points[aSym] += 1
      }
      // right
      if (
        a.x < 6 &&
        aSym === board[toIndex(a.x + 1, a.y)] &&
        aSym === board[toIndex(a.x + 2, a.y)]
      ) {
        hasMatch = true
        points[aSym] += 1
      }
      // bottom
      if (
        a.y < 6 &&
        aSym === board[toIndex(a.x, a.y + 1)] &&
        aSym === board[toIndex(a.x, a.y + 2)]
      ) {
        hasMatch = true
        points[aSym] += 1
      }
      // center
      if (
        a.y > 0 &&
        a.y < 7 &&
        aSym === board[toIndex(a.x, a.y - 1)] &&
        aSym === board[toIndex(a.x, a.y + 1)]
      ) {
        hasMatch = true
        points[aSym] += 1
      }

      // top
      if (
        b.y > 1 &&
        bSym === board[toIndex(b.x, b.y - 1)] &&
        bSym === board[toIndex(b.x, b.y - 2)]
      ) {
        hasMatch = true
        points[bSym] += 1
      }
      // left
      if (
        b.x > 1 &&
        bSym === board[toIndex(b.x - 1, b.y)] &&
        bSym === board[toIndex(b.x - 2, b.y)]
      ) {
        hasMatch = true
        points[bSym] += 1
      }
      // bottom
      if (
        b.y < 6 &&
        bSym === board[toIndex(b.x, b.y + 1)] &&
        bSym === board[toIndex(b.x, b.y + 2)]
      ) {
        hasMatch = true
        points[bSym] += 1
      }
      // center
      if (
        b.y > 0 &&
        b.y < 7 &&
        bSym === board[toIndex(b.x, b.y - 1)] &&
        bSym === board[toIndex(b.x, b.y + 1)]
      ) {
        hasMatch = true
        points[bSym] += 1
      }

      if (hasMatch) {
        moves.push({
          dir: 'h',
          origin: i,
          points,
        })
      }
    }

    // vertical swap check
    if (y < 7) {
      let hasMatch = false
      const points = [0, 0, 0, 0, 0, 0, 0]
      const a = { x, y }
      const b = { x: a.x, y: a.y + 1 }

      const board = [...tiles]
      const swap = board[i]
      board[i] = board[toIndex(b.x, b.y)]
      board[toIndex(b.x, b.y)] = swap

      const aSym = board[i]
      const bSym = board[toIndex(b.x, b.y)]

      // left
      if (
        a.x > 1 &&
        aSym === board[toIndex(a.x - 1, a.y)] &&
        aSym === board[toIndex(a.x - 2, a.y)]
      ) {
        hasMatch = true
        points[aSym] += 1
      }
      // top
      if (
        a.y > 1 &&
        aSym === board[toIndex(a.x, a.y - 1)] &&
        aSym === board[toIndex(a.x, a.y - 2)]
      ) {
        hasMatch = true
        points[aSym] += 1
      }
      // right
      if (
        a.x < 6 &&
        aSym === board[toIndex(a.x + 1, a.y)] &&
        aSym === board[toIndex(a.x + 2, a.y)]
      ) {
        hasMatch = true
        points[aSym] += 1
      }
      // center
      if (
        a.x > 0 &&
        a.x < 7 &&
        aSym === board[toIndex(a.x - 1, a.y)] &&
        aSym === board[toIndex(a.x + 1, a.y)]
      ) {
        hasMatch = true
        points[aSym] += 1
      }

      // left
      if (
        b.x > 1 &&
        bSym === board[toIndex(b.x - 1, b.y)] &&
        bSym === board[toIndex(b.x - 2, b.y)]
      ) {
        hasMatch = true
        points[bSym] += 1
      }
      // bottom
      if (
        b.y < 6 &&
        bSym === board[toIndex(b.x, b.y + 1)] &&
        bSym === board[toIndex(b.x, b.y + 2)]
      ) {
        hasMatch = true
        points[bSym] += 1
      }
      // right
      if (
        b.x < 6 &&
        bSym === board[toIndex(b.x + 1, b.y)] &&
        bSym === board[toIndex(b.x + 2, b.y)]
      ) {
        hasMatch = true
        points[bSym] += 1
      }
      // center
      if (
        b.x > 0 &&
        b.x < 7 &&
        bSym === board[toIndex(b.x - 1, b.y)] &&
        bSym === board[toIndex(b.x + 1, b.y)]
      ) {
        hasMatch = true
        points[bSym] += 1
      }

      if (hasMatch) {
        moves.push({
          dir: 'v',
          origin: i,
          points,
        })
      }
    }
  }

  return moves
}

function BotMatchManager({ match }: { match: BotMatch }) {
  const gameFn = useSetAtom(gameFunctions)
  const gameState = useAtomValue(gameStateAtom)
  const hero = useAtomValue(heroDisplayAtom(match.opponent.nft))
  const uses = useUseCount(hero)
  const isTransitioning = useAtomValue(isGameTransitioningAtom)

  useEffect(() => {
    if (isTransitioning) return
    if (!match) return
    if (!gameState) return
    if (match.opponent.nft !== gameState.currentTurn) return
    if (gameState.hashes.length >= 100) return

    const moves = findPossibleMoves([...gameState.tiles])

    let payload: any = {
      type: GameStateFunctions.SWAP_NODE,
      data: {
        publicKey: match.opponent.nft,
      },
    }

    if (moves.length === 0) {
      // random
      const dir = Math.random() > 0.5 ? 'h' : 'v'
      let origin = Math.floor(Math.random() * 56)

      // flip
      origin =
        dir === 'v'
          ? origin
          : (() => {
              const [x, y] = toCoord(origin)
              return toIndex(y, x)
            })()

      const [x, y] = toCoord(origin)

      payload.data.origin = dir + origin
      payload.data.node1 = { x, y }
      payload.data.node2 = {
        x: x + (dir === 'h' ? 1 : 0),
        y: y + (dir === 'v' ? 1 : 0),
      }
      payload.data.source = 'random'
    } else {
      // priority
      // - skill consumption: if skill is available, prioritize to match sword / shield / amulet
      // - mana collection: find dominant mana requirements (each skills, sum mana)
      // - execute ordinary commands (sword / shield / amulet)

      let prioritizedSkill = -1
      let count = 0

      uses.forEach((use, i) => {
        if (use.useCount > count) {
          prioritizedSkill = i
          count = use.useCount
        }
      })

      const movIdxPerPts = [-1, -1, -1, -1, -1, -1, -1].map((_, idx) => {
        let highest = -1
        let pt = 0
        moves.forEach((move, i) => {
          if (move.points[idx] > pt) {
            // amulets need 2 pts to be cast
            if (idx === 2 && move.points[idx] < 2) return
            highest = i
            pt = move.points[idx]
          }
        })

        return highest
      })

      let move: Move | undefined
      if (prioritizedSkill > -1 && movIdxPerPts[prioritizedSkill] > -1) {
        move = moves[movIdxPerPts[prioritizedSkill]]
        payload.data.source = 'command'
      } else {
        // try collect mana
        const manaPriority = uses
          .reduce(
            (acc, curr) => {
              curr.ratio.forEach((value, elem) => {
                if (typeof value !== 'undefined') {
                  acc[elem] += value[elem]
                }
              })
              return acc
            },
            [0, 0, 0, 0],
          )
          .map((amt, elem) => ({ amt, elem }))
          .sort((a, b) => b.amt - a.amt)

        const manaNotFull = [
          hero.fireMp !== hero.maxMp,
          hero.windMp !== hero.maxMp,
          hero.watrMp !== hero.maxMp,
          hero.eartMp !== hero.maxMp,
        ]

        for (let e = 0; e < 4; e++) {
          const idx = manaPriority[e].elem
          if (movIdxPerPts[3 + idx] !== -1 && manaNotFull[idx]) {
            move = moves[movIdxPerPts[3 + idx]]
            break
          }
        }

        move ??= moves[Math.floor(Math.random() * moves.length)]
        payload.data.source = 'mana'
      }

      const [x, y] = toCoord(move.origin)
      payload.data.origin = move.dir + move.origin
      payload.data.node1 = { x, y }
      payload.data.node2 = {
        x: x + (move.dir === 'h' ? 1 : 0),
        y: y + (move.dir === 'v' ? 1 : 0),
      }
    }

    gameFn(payload)

    // set(gameStateAtom, {...gameState })
  }, [match, isTransitioning, hero, uses, gameState, gameFn])

  return null
}
