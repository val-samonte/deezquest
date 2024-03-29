'use client'

import { GameTransitions } from '@/enums/GameTransitions'
import { animated, easings, Spring, useSpring } from '@react-spring/web'
import { Texture } from 'pixi.js'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Container, Sprite, usePixiTicker } from 'react-pixi-fiber/index.js'
import { useAtomValue } from 'jotai'
import { isPortraitAtom, tileSizeAtom } from '@/atoms/stageDimensionAtom'

function MagicCircle({ ...props }) {
  const [rotation, setRotation] = useState(0)
  const animate = useCallback((delta: number) => {
    setRotation((rotation) => rotation + 0.05 * delta)
  }, [])
  usePixiTicker(animate)
  return (
    <Sprite
      texture={Texture.from(`/magic_circle.svg`)}
      {...props}
      rotation={rotation}
    />
  )
}

const AnimatedContainer = animated(Container)
const AnimatedMagicCircle = animated(MagicCircle)

function Tile({ type, id, transition, ...props }: any) {
  const tileSize = useAtomValue(tileSizeAtom)
  const isPortrait = useAtomValue(isPortraitAtom)
  const [magicCircle, magicCircleApi] = useSpring(() => ({
    immediate: false,
    reset: true,
    from: {
      alpha: 0,
    },
    to: {
      alpha: 0.5,
    },
  }))

  const tilePos = useMemo(() => {
    return {
      tileSize,
      x: tileSize * (id % 8) + tileSize / 2,
      y: tileSize * Math.floor(id / 8) + tileSize / 2,
    }
  }, [tileSize, id])

  const showMagic = useRef(false)
  const showMagicCircle = useMemo(() => {
    switch (transition?.id) {
      case GameTransitions.DRAIN:
        if (transition?.variation === GameTransitions.DRAIN_GLOW) {
          magicCircleApi.start({
            to: { alpha: 0.5 },
          })
          showMagic.current = true
        }
      case GameTransitions.CAST:
      case GameTransitions.ATTACK_SPELL:
      case GameTransitions.BUFF_SPELL:
        return showMagic.current
      default: {
        magicCircleApi.set({ alpha: 0 })
        showMagic.current = false
        return false
      }
    }
  }, [transition, magicCircleApi])

  const transitionProps = useMemo(() => {
    props = {
      ...props,
      width: tilePos.tileSize,
      height: tilePos.tileSize,
      x: tilePos.x,
      y: tilePos.y,
      alpha: 1,
      rotation: 0,
    }

    switch (transition?.id) {
      case GameTransitions.SWAP: {
        const { x, y, ...rest } = props
        return {
          to: props,
          from: {
            ...rest,
            x: transition.from.x * tilePos.tileSize + tilePos.tileSize / 2,
            y: transition.from.y * tilePos.tileSize + tilePos.tileSize / 2,
          },
          config: {
            duration: transition.duration - 100,
            easing: easings.easeInOutBack,
            clamp: true,
          },
        }
      }
      case GameTransitions.DRAIN: {
        const { x, y, ...rest } = props
        const to = { ...rest }
        const config = {
          duration: transition.duration - 100,
          easing: easings.easeInBack,
          clamp: true,
        }

        switch (transition.variation) {
          case GameTransitions.DRAIN_GLOW: {
            break
          }
          case GameTransitions.DRAIN_FADE: {
            to.alpha = 0
            config.easing = easings.easeOutCubic
            break
          }
          case GameTransitions.DRAIN_STAB: {
            to.x = isPortrait ? tilePos.tileSize * 4 : tilePos.tileSize * 9
            to.y = isPortrait ? -tilePos.tileSize : tilePos.tileSize * 2
            to.rotation = isPortrait
              ? (-45 * Math.PI) / 180
              : (45 * Math.PI) / 180

            if (transition.asOpponent) {
              to.x = isPortrait ? tilePos.tileSize * 4 : -tilePos.tileSize
              to.y = isPortrait ? tilePos.tileSize * 9 : tilePos.tileSize * 2
              to.rotation = isPortrait
                ? (-225 * Math.PI) / 180
                : (225 * Math.PI) / 180
            }
            break
          }
          default: {
            to.x = isPortrait ? tilePos.tileSize * 4 : -tilePos.tileSize
            to.y = isPortrait ? tilePos.tileSize * 9 : tilePos.tileSize * 2
            to.alpha = 0
            to.width = tilePos.tileSize * 0.5
            to.height = tilePos.tileSize * 0.5

            if (transition.asOpponent) {
              to.x = isPortrait ? tilePos.tileSize * 4 : tilePos.tileSize * 9
              to.y = isPortrait ? -tilePos.tileSize : tilePos.tileSize * 2
            }
          }
        }

        return {
          from: props,
          to,
          config,
        }
      }
      case GameTransitions.NODE_OUT: {
        return {
          delay: transition.delay ?? 0,
          from: props,
          to: {
            alpha: 0,
          },
          config: {
            duration: transition.duration,
            easing: easings.easeOutCubic,
            clamp: true,
          },
        }
      }
      case GameTransitions.NODE_IN: {
        return {
          delay: transition.delay ?? 0,
          from: {
            ...props,
            alpha: 0,
          },
          to: props,
          config: {
            duration: transition.duration,
            easing: easings.easeOutCubic,
            clamp: true,
          },
        }
      }
      // case GameTransitions.ATTACK_SPELL:
      // case GameTransitions.BUFF_SPELL: {
      //   return {
      //     from: props,
      //     to: {
      //       alpha: 0,
      //     },
      //     config: {
      //       duration: transition.duration - 100,
      //       easing: easings.easeOutCubic,
      //       clamp: true,
      //     },
      //   }
      // }
      case GameTransitions.FILL: {
        const { x, y, ...rest } = props
        return {
          to: props,
          from: {
            ...rest,
            x: transition.from.x * tilePos.tileSize + tilePos.tileSize / 2,
            y: transition.from.y * tilePos.tileSize + tilePos.tileSize / 2,
          },
          config: {
            duration: transition.duration - 100,
            easing: easings.easeOutBounce,
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
  }, [tilePos, isPortrait, magicCircleApi, transition, props])

  // use different key every transition change
  // so that the 'from' transition works correctly
  // TODO: replace random
  const forceKey = useMemo(() => {
    return `${id}_${Math.floor(Math.random() * 100000)}`
  }, [id, transition])

  const skin = type ?? transition?.type

  return (
    <Spring {...transitionProps} key={forceKey}>
      {(props: any) => (
        <>
          <AnimatedContainer {...props} anchor='0.5,0.5'>
            <Sprite
              width={tileSize}
              height={tileSize}
              anchor='0.5,0.5'
              texture={
                skin !== null ? Texture.from(`/sym_${skin}.png`) : undefined
              }
            />
            {showMagicCircle && (
              <AnimatedMagicCircle
                anchor='0.5,0.5'
                alpha={magicCircle.alpha}
                width={tileSize}
                height={tileSize}
              />
            )}
          </AnimatedContainer>
        </>
      )}
    </Spring>
  )
}

export default Tile
