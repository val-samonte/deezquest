'use client'

import { useSpring, animated } from '@react-spring/web'
import classNames from 'classnames'
import { atom, useAtom } from 'jotai'
import { useEffect, useState } from 'react'

export const heroDamagedAtom = atom<{ hero: string; amount: number } | null>(
  null,
)

interface HeroPortraitProps {
  publicKey: string
  flip?: boolean
  spotlight?: boolean
}

export default function HeroPortrait({
  publicKey,
  flip,
  spotlight,
}: HeroPortraitProps) {
  const [damage, setDamage] = useAtom(heroDamagedAtom)

  const [isWobbling, setIsWobbling] = useState(false)
  const [inSpotlight, setInSpotlight] = useState(false)

  const wobbleAnimation = useSpring({
    transform: isWobbling
      ? `translateX(${flip ? 50 : -50}px) rotateZ(${flip ? 2.5 : -2.5}deg) ${
          flip ? 'scaleX(-1)' : ''
        }`
      : `translateX(0px) rotateZ(0deg) ${flip ? 'scaleX(-1)' : ''}`,
    config: {
      tension: 300,
      friction: 10,
    },
  })

  useEffect(() => {
    if (!publicKey) return
    if (publicKey !== damage?.hero) return
    setDamage(null)
    if (damage?.amount === 0) {
      return
    }

    setIsWobbling(true)
    setTimeout(() => {
      setIsWobbling(false)
    }, 100)
    setInSpotlight(true)
    setTimeout(() => {
      setInSpotlight(false)
    }, 600)
  }, [publicKey, damage, setDamage, setIsWobbling, setInSpotlight])

  return (
    <>
      <animated.div
        className={classNames(
          'bg-no-repeat bg-cover bg-center portrait:h-full landscape:w-full aspect-square',
          !(spotlight || inSpotlight) && 'brightness-50',
        )}
        style={{
          ...wobbleAnimation,
          backgroundImage: `url("https://shdw-drive.genesysgo.net/52zh6ZjiUQ5UKCwLBwob2k1BC3KF2qhvsE7V4e8g2pmD/SolanaSpaceman.png")`,
        }}
      />
    </>
  )
}
