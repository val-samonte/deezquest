'use client'

import { GameTransitions } from '@/constants/GameTransitions'
import { animated, Spring } from '@react-spring/web'
import { Texture } from 'pixi.js'
import { useMemo } from 'react'
import { Sprite } from 'react-pixi-fiber'
import { easeBounceOut, easeBackIn, easeBackInOut } from 'd3-ease'
import { useAtomValue } from 'jotai'
import { isPortraitAtom, tileSizeAtom } from '@/atoms/stageDimensionAtom'

const AnimatedSprite = animated(Sprite)

function Tile({ type, id, transition, ...props }: any) {
  const tileSize = useAtomValue(tileSizeAtom)
  const isPortrait = useAtomValue(isPortraitAtom)

  const transitionProps = useMemo(() => {
    props = {
      ...props,
      width: tileSize,
      height: tileSize,
      x: props.x * tileSize,
      y: props.y * tileSize,
      alpha: 1,
    }

    switch (transition?.id) {
      case GameTransitions.SWAP: {
        const { x, y, ...rest } = props
        return {
          to: props,
          from: {
            ...rest,
            x: transition.from.x * tileSize,
            y: transition.from.y * tileSize,
          },
          config: {
            duration: transition.duration - 100,
            easing: easeBackInOut,
            clamp: true,
          },
        }
      }
      case GameTransitions.DRAIN: {
        const { x, y, ...rest } = props
        return {
          to: {
            ...rest,
            x: isPortrait ? tileSize * 4 : -tileSize,
            y: isPortrait ? tileSize * 9 : tileSize * 4,
            alpha: 0,
            width: tileSize * 0.5,
            height: tileSize * 0.5,
          },
          from: { ...props, alpha: 1, width: tileSize, height: tileSize },
          config: {
            duration: transition.duration - 100,
            easing: easeBackIn,
            clamp: true,
          },
        }
      }
      case GameTransitions.FILL: {
        const { x, y, ...rest } = props
        return {
          to: props,
          from: {
            ...rest,
            x: transition.from.x * tileSize,
            y: transition.from.y * tileSize,
          },
          config: {
            duration: transition.duration - 100,
            easing: easeBounceOut,
            clamp: true,
          },
        }
      }
    }

    return {
      to: props,
      from: props,
      config: {
        duration: 0,
        clamp: true,
      },
    }
  }, [transition, tileSize, isPortrait, props])

  // use different key every transition change
  // so that the 'from' transition works correctly
  const forceKey = useMemo(() => {
    return `${id}_${Math.floor(Math.random() * 100000)}`
  }, [id, transition])

  const skin = type ?? transition?.type

  return (
    <Spring {...transitionProps} key={forceKey}>
      {(props: any) => (
        <AnimatedSprite
          texture={skin !== null ? Texture.from(`/sym_${skin}.png`) : undefined}
          {...props}
        />
      )}
    </Spring>
  )
}

export default Tile
