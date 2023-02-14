'use client'

import { GameTransitions } from '@/constants/GameTransitions'
import { animated, Spring } from '@react-spring/web'
import { Texture } from 'pixi.js'
import { useMemo, useRef } from 'react'
import { Sprite } from 'react-pixi-fiber'

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
            duration: transition.duration - 200,
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
          },
          from: { ...props, alpha: 1 },
          config: {
            duration: transition.duration - 200,
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
            duration: transition.duration - 200,
            clamp: true,
          },
        }
      }
    }
    props.alpha = 1
    props.zIndex = 1
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

  return (
    <Spring {...transitionProps} key={forceKey}>
      {(props: any) => (
        <AnimatedSprite
          texture={type !== null ? Texture.from(`/sym_${type}.png`) : undefined}
          {...props}
        />
      )}
    </Spring>
  )
}

export default Tile
