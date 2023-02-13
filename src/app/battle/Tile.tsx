'use client'

import { GameTransitions } from '@/constants/GameTransitions'
import { animated, Spring } from '@react-spring/web'
import { Texture } from 'pixi.js'
import { useMemo } from 'react'
import { Sprite } from 'react-pixi-fiber'

const AnimatedSprite = animated(Sprite)

function Tile({ type, transition, ...props }: any) {
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
            duration: transition.duration,
          },
        }
      }
    }
    return {
      to: props,
      from: props,
    }
  }, [transition, props])

  return (
    <Spring {...transitionProps} key={type || 'blank'}>
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
