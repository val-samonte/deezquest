'use client'

import { GameTransitions } from '@/constants/GameTransitions'
import { animated, Spring } from '@react-spring/web'
import { Texture } from 'pixi.js'
import { useMemo } from 'react'
import { Sprite } from 'react-pixi-fiber'
import { easeBounceOut, easeBackIn, easeBackInOut } from 'd3-ease'

const AnimatedSprite = animated(Sprite)

function Tile({ type, id, transition, ...props }: any) {
  const transitionProps = useMemo(() => {
    switch (transition?.id) {
      case GameTransitions.SWAP: {
        const { x, y, ...rest } = props
        return {
          to: props,
          from: {
            ...rest,
            x: transition.from.x,
            y: transition.from.y,
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
            x: -rest.width,
            y: rest.height * 4,
            alpha: 0,
            width: rest.width * 0.5,
            height: rest.height * 0.5,
          },
          from: { ...props, alpha: 1, width: rest.width, height: rest.height },
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
            x: transition.from.x,
            y: transition.from.y,
          },
          config: {
            duration: transition.duration - 100,
            easing: easeBounceOut,
            clamp: true,
          },
        }
      }
    }
    props.alpha = 1

    return {
      to: props,
      from: props,
      config: {
        duration: 0,
        clamp: true,
      },
    }
  }, [transition, props])

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
