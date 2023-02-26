'use client'

import { animated, useSpringValue } from '@react-spring/web'
import classNames from 'classnames'
import { useEffect } from 'react'

export default function AnimatedCounter({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  const animatedValue = useSpringValue(value)

  useEffect(() => {
    animatedValue.start(value)
  }, [value, animatedValue])

  return (
    <animated.span className={classNames(className)}>
      {animatedValue.to((n) => n.toFixed(0))}
    </animated.span>
  )
}
