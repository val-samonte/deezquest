'use client'

import {
  gameFunctions,
  gameTransitionQueueAtom,
  isGameTransitioningAtom,
  playerKpAtom,
} from '@/atoms/gameStateAtom'
import { isPortraitAtom, stageDimensionAtom } from '@/atoms/stageDimensionAtom'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Application, ICanvas } from 'pixi.js'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AppContext, Container, Stage as PixiStage } from 'react-pixi-fiber'
import PlayerCard, { updateHeroesAtom } from './PlayerCard'
import StageCursor from './StageCursor'
import Tile from './Tile'
import { GameStateFunctions } from '@/enums/GameStateFunctions'
import CastingDisplay from './CastingDisplay'
import { SkillTypes } from '@/enums/SkillTypes'
import { GameTransitions } from '@/enums/GameTransitions'
import { heroDamagedAtom } from './HeroPortrait'
import { sleep } from '@/utils/sleep'

export default function Stage() {
  const gameFn = useSetAtom(gameFunctions)
  const updateHeroes = useSetAtom(updateHeroesAtom)
  const setIsTransitioning = useSetAtom(isGameTransitioningAtom)
  const [transitionQueue, setTransitionQueue] = useAtom(gameTransitionQueueAtom)
  const setDamage = useSetAtom(heroDamagedAtom)
  const [tiles, setTiles] = useState<any[]>([])
  const [skill, setSkill] = useState<{
    name: string
    lvl: number
    type: SkillTypes
  }>()

  const playerKp = useAtomValue(playerKpAtom)
  const player = useMemo(
    () => playerKp?.publicKey.toBase58() ?? null,
    [playerKp],
  )
  const [opponent] = useState(localStorage.getItem('demo_opponent') || null)

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
                asOpponent: next.turn !== player,
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

      if (next.damage) {
        setDamage(next.damage)
      }

      await sleep(next.duration ? next.duration + 100 : 100)
      currentTransition.current = null

      setTransitionQueue(queue)
    })()
  }, [
    transitionQueue,
    setTransitionQueue,
    updateHeroes,
    setIsTransitioning,
    setDamage,
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
        {player && <PlayerCard publicKey={player} />}
      </div>
      <div className='relative flex-none landscape:h-full portrait:w-full aspect-square flex items-center justify-center p-2 lg:p-5 backdrop-blur-sm '>
        <div className='landscape:h-full portrait:w-full aspect-square overflow-hidden '>
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
        {opponent && <PlayerCard asOpponent publicKey={opponent} />}
      </div>
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
