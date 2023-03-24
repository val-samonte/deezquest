'use client'

import { gameStateAtom } from '@/atoms/gameStateAtom'
import { useMetaplex } from '@/atoms/metaplexAtom'
import { JsonMetadata } from '@metaplex-foundation/js'
import { useSpring, animated, useSpringValue } from '@react-spring/web'
import { PublicKey } from '@solana/web3.js'
import classNames from 'classnames'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useEffect, useMemo, useRef, useState } from 'react'
import { heroDisplayAtom } from './PlayerCard'

interface HeroPortraitProps {
  publicKey: string
  dummy?: boolean
  flip?: boolean
  spotlight?: boolean
}

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

export default function HeroPortrait({
  publicKey,
  dummy,
  flip,
  spotlight,
}: HeroPortraitProps) {
  const hero = useAtomValue(heroDisplayAtom(publicKey))
  const hpState = useRef(0)
  const [hpDiff, setHpDiff] = useState({ amt: 0 })
  const [isWobbling, setIsWobbling] = useState(false)
  const [inSpotlight, setInSpotlight] = useState(false)

  const metaplex = useMetaplex()
  const [metadata, setMetadata] = useState<JsonMetadata | null>(null)

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
    if (!hero) return
    if (hpState.current === hero.hp) return
    setHpDiff({ amt: hero.hp - hpState.current })
    hpState.current = hero.hp
  }, [hero, setHpDiff])

  useEffect(() => {
    setInSpotlight(true)
    setTimeout(() => {
      setInSpotlight(false)
    }, 1000)

    if (hpDiff.amt > 0) return

    setIsWobbling(true)
    setTimeout(() => {
      setIsWobbling(false)
    }, 100)
  }, [hpDiff, setIsWobbling, setInSpotlight])

  useEffect(() => {
    if (!publicKey || !metaplex) return
    if (dummy) return

    metaplex
      .nfts()
      .findByMint({ mintAddress: new PublicKey(publicKey) })
      .then((nft) => {
        setMetadata(nft.json)
      })
  }, [publicKey, dummy, metaplex])

  const url = useMemo(() => {
    if (dummy) {
      return 'https://shdw-drive.genesysgo.net/52zh6ZjiUQ5UKCwLBwob2k1BC3KF2qhvsE7V4e8g2pmD/SolanaSpaceman.png'
    }
    return metadata?.image ?? ''
  }, [metadata, dummy])

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
      marginBottom: '-100px',
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
  }, [hpDiff, opacity, api])

  return (
    <>
      <animated.div
        className={classNames(
          'bg-no-repeat bg-cover bg-center portrait:h-full landscape:w-full aspect-square transition-colors duration-500',
          !(spotlight || inSpotlight) && 'grayscale',
        )}
        style={{
          ...wobbleAnimation,
          backgroundImage: `url("${url}")`,
        }}
      />
      <animated.div
        className='absolute bottom-0 inset-x-0 text-center'
        style={{ opacity }}
      >
        <animated.div
          className={classNames(
            'text-3xl md:text-4xl xl:text-7xl',
            'text-black stroked font-mono font-black',
            'text-center',
          )}
          style={textProps}
        >
          {hpDiff.amt ?? ''}
        </animated.div>
        <animated.div
          className={classNames(
            'text-3xl md:text-4xl xl:text-7xl',
            hpDiff.amt > 0 ? 'text-lime-500' : 'text-red-600',
            'font-mono font-black',
            'absolute inset-0 text-center',
          )}
          style={textProps}
        >
          {hpDiff.amt ?? ''}
        </animated.div>
      </animated.div>
    </>
  )
}
