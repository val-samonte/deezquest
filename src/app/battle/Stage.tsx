'use client'

import {
  gameStateAtom,
  gameFunctions,
  gameTransitionQueueAtom,
  isGameTransitioningAtom,
  gameResultAtom,
} from '@/atoms/gameStateAtom'
import { isPortraitAtom, stageDimensionAtom } from '@/atoms/stageDimensionAtom'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Application, ICanvas } from 'pixi.js'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  AppContext,
  Container,
  Stage as PixiStage,
} from 'react-pixi-fiber/index.js'
import PlayerCard, { updateHeroesAtom } from './PlayerCard'
import StageCursor from './StageCursor'
import Tile from './Tile'
import { GameStateFunctions } from '@/enums/GameStateFunctions'
import CastingDisplay from './CastingDisplay'
import { SkillTypes } from '@/enums/SkillTypes'
import { GameTransitions } from '@/enums/GameTransitions'
import { sleep } from '@/utils/sleep'
import { PeerMessages } from '@/enums/PeerMessages'
import { useRouter } from 'next/navigation'
import { peerAtom } from '@/atoms/peerConnectionAtom'
import { matchAtom } from '@/atoms/matchAtom'
import { Transition } from '@headlessui/react'
import { MatchTypes } from '@/enums/MatchTypes'

export default function Stage() {
  const router = useRouter()
  const gameFn = useSetAtom(gameFunctions)
  const setGameState = useSetAtom(gameStateAtom)
  const updateHeroes = useSetAtom(updateHeroesAtom)
  const setIsTransitioning = useSetAtom(isGameTransitioningAtom)
  const [transitionQueue, setTransitionQueue] = useAtom(gameTransitionQueueAtom)
  const [tiles, setTiles] = useState<any[]>([])
  const [skill, setSkill] = useState<{
    name: string
    lvl: number
    type: SkillTypes
  }>()
  const [match, setMatch] = useAtom(matchAtom)
  const [gameResult, setGameResult] = useAtom(gameResultAtom)
  const peerInstance = useAtomValue(peerAtom)

  const currentTransition = useRef<any>(null)
  useEffect(() => {
    if (currentTransition.current) return
    ;(async () => {
      if (transitionQueue.length === 0) {
        setIsTransitioning(false)
        return
      }

      const [next, ...queue] = transitionQueue
      currentTransition.current = next

      setIsTransitioning(true)

      next.tiles &&
        setTiles(
          next.tiles.map((type: any, i: number) => {
            if (next.nodes?.[i]) {
              const transition: any = {
                id: next.type,
                type: next.nodes[i].type,
                asOpponent: next.turn !== match?.player.nft,
                variation: next.nodes[i].variation,
                duration: next.duration,
                delay: next.nodes[i].delay,
              }

              if (next.nodes[i].from) {
                transition.from = { ...next.nodes[i].from }
              }

              return {
                type,
                transition,
              }
            }

            return { type }
          }),
        )

      if (next.heroes) {
        updateHeroes(next.heroes)
      }

      if (next.type === GameTransitions.CAST) {
        setSkill(next.skill)
      }

      if (next.type === GameTransitions.WIN) {
        setGameResult('win')
      } else if (next.type === GameTransitions.LOSE) {
        setGameResult('lose')
      } else if (next.type === GameTransitions.DRAW) {
        setGameResult('draw')
      }

      await sleep(next.duration ? next.duration + 100 : 100)
      currentTransition.current = null

      setTransitionQueue(queue)
    })()
  }, [
    match,
    transitionQueue,
    setTransitionQueue,
    updateHeroes,
    setIsTransitioning,
    setGameResult,
    setTiles,
    setSkill,
  ])

  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current) return

    gameFn({
      type: GameStateFunctions.INIT,
    })

    loaded.current = true
  }, [])

  return (
    <div className='relative w-full h-full flex portrait:flex-col-reverse'>
      <div className='relative p-2 w-full h-full'>
        {match?.player && <PlayerCard heroPublicKey={match.player.nft} />}
      </div>
      <div className='relative flex-none landscape:h-full portrait:w-full aspect-square flex items-center justify-center p-2 lg:p-5'>
        <div className='landscape:h-full portrait:w-full aspect-square overflow-hidden rounded'>
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
        <CastingDisplay skill={skill} />
      </div>
      <div className='relative p-2 w-full h-full'>
        {match?.opponent && (
          <PlayerCard
            asOpponent
            heroPublicKey={match.opponent.nft}
            dummy={match.matchType === MatchTypes.BOT}
          />
        )}
      </div>
      {gameResult && (
        <Transition
          show={true}
          appear={true}
          enter='transition-opacity duration-500'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          className='fixed inset-x-0 top-0 bottom-14 xl:bottom-16 bg-black/80 flex flex-col items-center justify-center gap-5'
        >
          <img
            src={
              { win: '/you_win.png', lose: '/you_lose.png', draw: '/draw.png' }[
                gameResult
              ]
            }
            className='m-10 mb-5 max-h-32 lg:max-h-none'
          />
          {match?.matchType === MatchTypes.FRIENDLY && (
            <div className='flex gap-5 mx-5'>
              <button
                className='px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded'
                onClick={() => {
                  window.sessionStorage.clear()
                  setGameState(null)
                  gameFn({
                    type: GameStateFunctions.INIT,
                  })
                  setGameResult('')
                  match?.opponent?.peerId &&
                    peerInstance?.sendMessage(match.opponent.peerId, {
                      type: PeerMessages.REMATCH,
                    })
                }}
              >
                Rematch
              </button>
              <button
                className='px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded'
                onClick={() => {
                  if (
                    match?.matchType === MatchTypes.FRIENDLY &&
                    match?.opponent.peerId
                  ) {
                    peerInstance?.sendMessage(match?.opponent.peerId, {
                      type: PeerMessages.QUIT,
                    })
                  }
                  window.sessionStorage.clear()
                  setGameState(null)
                  setMatch(null)
                  setGameResult('')
                  router.push('/barracks')
                }}
              >
                Return to Barracks
              </button>
            </div>
          )}

          {match?.matchType === MatchTypes.BOT && (
            <div className='flex gap-5 mx-5'>
              <button
                className='px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded'
                onClick={() => {
                  window.sessionStorage.clear()
                  setGameState(null)
                  gameFn({
                    type: GameStateFunctions.INIT,
                  })
                  setGameResult('')
                }}
              >
                Rematch
              </button>
              <button
                className='px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded'
                onClick={() => {
                  window.sessionStorage.clear()
                  setGameState(null)
                  setMatch(null)
                  setGameResult('')
                  router.push('/barracks')
                }}
              >
                Return to Barracks
              </button>
            </div>
          )}
        </Transition>
      )}
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
