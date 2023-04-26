'use client'

import { SkillTypes } from '@/enums/SkillTypes'
import { animated, useSpring, useSpringValue } from '@react-spring/web'
import { useEffect, useRef } from 'react'

const textSpring = {
  delay: 300,
  from: {
    opacity: 0,
    marginBottom: '-200px',
  },
  to: {
    opacity: 1,
    marginBottom: '0px',
  },
  config: {
    mass: 1,
    tension: 180,
    friction: 12,
  },
}

export default function CastingDisplay({
  skill,
}: {
  skill?: { name: string; lvl: number; type: SkillTypes }
}) {
  const opacity = useSpringValue(0)
  const [textProps, api] = useSpring(() => textSpring, [])

  const durationRef = useRef<number>()
  useEffect(() => {
    if (durationRef.current) {
      window.clearTimeout(durationRef.current)
    }
    opacity.start({
      from: 0,
      to: 1,
    })
    api.set({
      opacity: 0,
      marginBottom: '-200px',
    })
    api.start(textSpring)

    durationRef.current = window.setTimeout(() => {
      opacity.start({
        to: 0,
      })
    }, 1500)

    return () => {
      window.clearTimeout(durationRef.current)
      opacity.start({
        to: 0,
      })
    }
  }, [skill, opacity, api])

  if (!skill) return null

  return (
    <animated.div
      key={`cast_${skill.name}`}
      style={{ opacity }}
      className='bg-black/80 absolute inset-0 flex items-center justify-center pointer-events-none'
    >
      <animated.div
        key={`cast_text_${skill.name}`}
        style={textProps}
        className='relative text-3xl sm:text-4xl xl:text-6xl font-bold flex items-center gap-3 md:gap-5'
      >
        <div className='flex items-center justify-center gap-3 md:gap-5'>
          <img
            src={`/cmd_${skill.type}.svg`}
            className='w-10 h-10 md:w-12 md:h-12'
          />
          <span className='font-serif'>
            {skill.name} {['', 'II', 'III'][skill.lvl - 1]}
          </span>
        </div>
      </animated.div>
    </animated.div>
  )
}
