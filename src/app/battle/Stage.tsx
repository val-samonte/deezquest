'use client'

import {
  gameFunctions,
  gameTransitionStackAtom,
  isGameTransitioningAtom,
  playerKpAtom,
  resetGameTransitionStackAtom,
} from '@/atoms/gameStateAtom'
import { isPortraitAtom, stageDimensionAtom } from '@/atoms/stageDimensionAtom'
import { useAtomValue, useSetAtom } from 'jotai'
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

export default function Stage() {
  const gameFn = useSetAtom(gameFunctions)
  const updateHeroes = useSetAtom(updateHeroesAtom)
  const setIsTransitioning = useSetAtom(isGameTransitioningAtom)
  const transitionStack = useAtomValue(gameTransitionStackAtom)
  const [stackCounter, setStackCounter] = useState(-1)
  const resetTransitionStack = useSetAtom(resetGameTransitionStackAtom)
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

  const setDamage = useSetAtom(heroDamagedAtom)

  useEffect(() => {
    if (transitionStack.length === 0) return

    let stack: any
    for (let i = 0; i < transitionStack.length; i++) {
      if (stackCounter < transitionStack[i].order) {
        stack = transitionStack[i]
        break
      }
    }

    if (!stack) {
      setIsTransitioning(false)
      setStackCounter(-1)
      resetTransitionStack()
      return
    }

    setIsTransitioning(true)

    stack.tiles &&
      setTiles(
        stack.tiles.map((type: any, i: number) => {
          if (stack.nodes?.[i]) {
            const transition: any = {
              id: stack.type,
              type: stack.nodes[i].type,
              asOpponent: stack.turn !== player,
              variation: stack.nodes[i].variation,
              duration: stack.duration,
            }

            if (stack.nodes[i].from) {
              transition.from = { ...stack.nodes[i].from }
            }

            return {
              type,
              transition,
            }
          }

          return { type }
        }),
      )

    if (stack.heroes) {
      // console.log(stack.type, opponent && stack.heroes[opponent])
      updateHeroes(stack.heroes)
    }

    if (stack.type === GameTransitions.CAST) {
      setSkill(stack.skill)
    }

    if (stack.damage) {
      setDamage({ hero: stack.damage, amount: 10 })
    }

    setTimeout(
      () => {
        setStackCounter(stack.order)
      },
      stack.duration ? stack.duration + 100 : 0,
    )
  }, [
    transitionStack,
    stackCounter,
    player,
    opponent,
    resetTransitionStack,
    setTiles,
    setIsTransitioning,
    setSkill,
    setDamage,
    updateHeroes,
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
      <div className='p-2 w-full h-full'>
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
      <div className='p-2 w-full h-full'>
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
