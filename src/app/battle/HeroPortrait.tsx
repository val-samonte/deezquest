'use client'

import { isXNftAtom } from '@/atoms/isXNftAtom'
import { useMetaplex } from '@/atoms/metaplexAtom'
import AttributesDisplay from '@/components/AttributesDisplay'
import { Dialog } from '@/components/Dialog'
import { HeroAttributes } from '@/enums/HeroAttributes'
import { computeAttribute } from '@/utils/computeAttribute'
import { trimAddress } from '@/utils/trimAddress'
import { JsonMetadata } from '@metaplex-foundation/js'
import { useSpring, animated, useSpringValue } from '@react-spring/web'
import { PublicKey } from '@solana/web3.js'
import classNames from 'classnames'
import { useAtomValue } from 'jotai'
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
  const isXNft = useAtomValue(isXNftAtom)

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

  const [showDetails, setShowDetails] = useState(false)

  return (
    <>
      <animated.div
        onClick={() => setShowDetails(true)}
        className={classNames(
          'cursor-pointer bg-no-repeat bg-cover bg-center portrait:h-full landscape:w-full aspect-square transition-colors duration-500',
          !(spotlight || inSpotlight) && 'grayscale',
        )}
        style={{
          ...wobbleAnimation,
          backgroundImage: `url("${url}")`,
        }}
      />
      <animated.div
        className='absolute bottom-0 inset-x-0 text-center pointer-events-none'
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
      <Dialog
        show={showDetails}
        onClose={() => setShowDetails(false)}
        className='max-w-sm'
      >
        <div className='px-5 flex gap-5 items-center'>
          <div className='flex-none'>
            <img
              src={url}
              className='w-20 h-20 aspect-square object-contain rounded'
            />
          </div>
          {isXNft && metadata ? (
            <div className='flex flex-col justify-center'>
              <h2 className='text-3xl'>{metadata.name}</h2>
            </div>
          ) : !dummy && metadata ? (
            <a
              href={`https://solscan.io/token/${publicKey}?cluster=devnet`}
              target='_blank'
              rel='noreferrer'
              className='outline-none flex flex-col justify-center'
            >
              <h2 className='text-3xl'>{metadata.name}</h2>
              <small className='text-base opacity-50'>
                {trimAddress(publicKey)}
              </small>
            </a>
          ) : (
            <div className='flex flex-col justify-center'>
              <h2 className='text-3xl'>Practice Bot</h2>
            </div>
          )}
        </div>
        <AttributesDisplay hero={hero} />
        <div className='grid grid-cols-2 px-5 gap-x-5 gap-y-2 mb-5'>
          <span className='flex items-center'>
            <span className='text-neutral-300 flex-auto'>Total HP: </span>
            <span className='font-bold text-lime-600'>{hero.maxHp}</span>
          </span>
          <span className='flex items-center'>
            <span className='text-neutral-300 flex-auto'>Turn Points: </span>
            <span className='font-bold text-lime-600'>
              {computeAttribute(HeroAttributes.SPD, hero.spd).turnPoints}
            </span>
          </span>
          <span className='flex items-center'>
            <span className='text-neutral-300 flex-auto'>Total MP: </span>
            <span className='font-bold text-lime-600'>{hero.maxMp}</span>
          </span>
          <span className='flex items-center'>
            <span className='text-neutral-300 flex-auto'>Absorb MP: </span>
            <span className='font-bold text-lime-600'>
              {computeAttribute(HeroAttributes.INT, hero.int).absorbMp}
            </span>
          </span>
          <span className='flex items-center'>
            <span className='text-neutral-300 flex-auto'>Base DMG: </span>
            <span className='font-bold text-lime-600'>{hero.baseDmg}</span>
          </span>
          <span className='flex items-center'>
            <span className='text-neutral-300 flex-auto'>Carry Cap: </span>
            <span className='font-bold text-lime-600'>{hero.str}</span>
          </span>
        </div>
        <div className='flex-auto h-10' />
        <button
          type='button'
          className={classNames(
            'mx-5 px-3 py-2 bg-neutral-700 hover:bg-neutral-600 rounded',
          )}
          onClick={() => setShowDetails(false)}
        >
          Close Hero Details
        </button>
      </Dialog>
    </>
  )
}
