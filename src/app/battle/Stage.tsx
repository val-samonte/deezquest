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

export default function Stage() {
  const gameFn = useSetAtom(gameFunctions)
  const updateHeroes = useSetAtom(updateHeroesAtom)
  const setIsTransitioning = useSetAtom(isGameTransitioningAtom)
  const transitionStack = useAtomValue(gameTransitionStackAtom)
  const [stackCounter, setStackCounter] = useState(-1)
  const resetTransitionStack = useSetAtom(resetGameTransitionStackAtom)
  const [tiles, setTiles] = useState<any[]>([])

  const playerKp = useAtomValue(playerKpAtom)
  const player = useMemo(
    () => playerKp?.publicKey.toBase58() ?? null,
    [playerKp],
  )
  const [opponent] = useState(localStorage.getItem('demo_opponent') || null)

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
          const props = {
            type,
            x: i % 8,
            y: Math.floor(i / 8),
          }

          if (stack.nodes?.[i]) {
            const transition = {
              id: stack.type,
              type: stack.nodes[i].type,
              variation: stack.nodes[i].variation,
              duration: stack.duration,
              from: {
                x: stack.nodes[i].from.x,
                y: stack.nodes[i].from.y,
              },
            }

            return {
              ...props,
              transition,
            }
          }

          return props
        }),
      )

    if (stack.heroes) {
      updateHeroes(stack.heroes)
    }

    // ATTACK_NORMAL
    // BUFF_ARMOR
    // CAST
    // ATTACK_SPELL
    // BUFF_SPELL

    // target: command.skill.target,
    // - apply slash effect / shake profile for damage
    // - apply refresh effect for buff / heal

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

  // const props = useSpring({
  //   delay: 500,
  //   from: {
  //     opacity: 0,
  //     marginBottom: '-200px',
  //   },
  //   to: {
  //     opacity: 1,
  //     marginBottom: '0px',
  //   },
  //   config: {
  //     mass: 1,
  //     tension: 180,
  //     friction: 12,
  //   },
  // })

  return (
    <div className='relative w-full h-full flex portrait:flex-col-reverse'>
      <div className='p-2 w-full h-full '>
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
        {/* TODO */}
        {/* <div className='bg-black/80 absolute inset-0 flex items-center justify-center'>
          <animated.div
            style={props}
            className='relative text-3xl xs:text-4xl font-bold flex items-center gap-3 md:gap-5'
          >
            <div className='flex items-center justify-center gap-3 md:gap-5'>
              <img
                src='/cmd_attack.svg'
                className='w-10 h-10 md:w-12 md:h-12'
              />
              <span>Crushing Blow</span>
            </div>
          </animated.div>
        </div> */}
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
