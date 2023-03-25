'use client'

import { gameStateAtom } from '@/atoms/gameStateAtom'
import { useMetaplex } from '@/atoms/metaplexAtom'
import { Dialog } from '@/components/Dialog'
import { trimAddress } from '@/utils/trimAddress'
import { Popover } from '@headlessui/react'
import { JsonMetadata } from '@metaplex-foundation/js'
import { useSpring, animated, useSpringValue } from '@react-spring/web'
import { PublicKey } from '@solana/web3.js'
import classNames from 'classnames'
import { atom, useAtom, useAtomValue } from 'jotai'
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { usePopper } from 'react-popper'
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
          {!dummy && metadata ? (
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
        <div className='grid grid-cols-4 gap-2 px-5 my-5'>
          <AttributeTile attrName='int' value={hero.int}>
            <div className='font-bold mb-2 flex pb-1 border-b border-b-white/5'>
              <span className='flex-auto'>Intelligence</span>
              <div className={classNames('flex items-center gap-3 font-bold')}>
                <span className='flex items-center xl:gap-2'>
                  <img src='/stat_int.svg' className='w-4 h-4 lg:w-6 lg:h-6' />
                  {hero.int}
                </span>
              </div>
            </div>
            <div className='grid grid-cols-2 mb-2'>
              <span>
                <span className='text-neutral-300'>Total MP: </span>
                <span className='font-bold text-lime-600'>
                  {hero.fireMpCap}
                </span>
              </span>
              <span>
                <span className='text-neutral-300'>Absorb MP: </span>
                <span className='font-bold text-lime-600'>
                  {Math.floor((hero.int - 1) / 3)}
                </span>
              </span>
            </div>
            <div className='text-xs'>
              Affects the maximum mana capacity of the hero. Mana capacity
              increases by 1 point per each point of INT. Whenever the hero
              absorbs mana, a bonus of 1/2/3 points per each element are gained
              for levels 4/7/10 of INT.
            </div>
          </AttributeTile>
          <AttributeTile attrName='spd' value={hero.spd}>
            <div className='font-bold mb-2 flex pb-1 border-b border-b-white/5'>
              <span className='flex-auto'>Speed</span>
              <div className={classNames('flex items-center gap-3 font-bold')}>
                <span className='flex items-center xl:gap-2'>
                  <img src='/stat_spd.svg' className='w-4 h-4 lg:w-6 lg:h-6' />
                  {hero.spd}
                </span>
              </div>
            </div>
            <div className='grid grid-cols-1 mb-2'>
              <span>
                <span className='text-neutral-300'>Turn Points: </span>
                <span className='font-bold text-lime-600'>
                  {Math.min(hero.spd + 15, 50)}
                </span>
              </span>
            </div>
            <div className='text-xs'>
              Affects the <span className='italic font-bold'>Turn Points</span>{' '}
              of the hero. The higher the hero&apos;s Turn Point value against
              the opponent&apos;s, the more likely the hero will get an extra
              turn.
            </div>
          </AttributeTile>
          <AttributeTile attrName='vit' value={hero.vit}>
            <div className='font-bold mb-2 flex pb-1 border-b border-b-white/5'>
              <span className='flex-auto'>Vitality</span>
              <div className={classNames('flex items-center gap-3 font-bold')}>
                <span className='flex items-center xl:gap-2'>
                  <img src='/stat_vit.svg' className='w-4 h-4 lg:w-6 lg:h-6' />
                  {hero.vit}
                </span>
              </div>
            </div>
            <div className='grid grid-cols-1 mb-2'>
              <span>
                <span className='text-neutral-300'>Total HP: </span>
                <span className='font-bold text-lime-600'>{hero.hpCap}</span>
              </span>
            </div>
            <div className='text-xs'>
              Affects the maximum hit points capacity of the hero. HP capacity
              increases by 3 point per each point of VIT. An additional bonus HP
              of 5/10/15 for levels 4/7/10 of VIT.
            </div>
          </AttributeTile>
          <AttributeTile attrName='str' value={hero.str}>
            <div className='font-bold mb-2 flex pb-1 border-b border-b-white/5'>
              <span className='flex-auto'>Strength</span>
              <div className={classNames('flex items-center gap-3 font-bold')}>
                <span className='flex items-center xl:gap-2'>
                  <img src='/stat_str.svg' className='w-4 h-4 lg:w-6 lg:h-6' />
                  {hero.str}
                </span>
              </div>
            </div>
            <div className='grid grid-cols-2 mb-2'>
              <span>
                <span className='text-neutral-300'>Base DMG: </span>
                <span className='font-bold text-lime-600'>{hero.baseDmg}</span>
              </span>
              <span>
                <span className='text-neutral-300'>Carry Cap: </span>
                <span className='font-bold text-lime-600'>{hero.str}</span>
              </span>
            </div>
            <div className='text-xs'>
              Affects the <span className='italic font-bold'>Base Damage</span>{' '}
              and Carrying Capacity of the hero. Base Damage is the physical
              damage dealt by the offensive command (matching the sword
              symbols). Carrying Capacity is the maximum weight limit of the
              items that the hero can equip.
            </div>
          </AttributeTile>
        </div>
        <div className='grid grid-cols-2 px-5 gap-x-5 gap-y-2 mb-5'>
          <span className='flex items-center'>
            <span className='text-neutral-300 flex-auto'>Total HP: </span>
            <span className='font-bold text-lime-600'>{hero.hpCap}</span>
          </span>
          <span className='flex items-center'>
            <span className='text-neutral-300 flex-auto'>Turn Points: </span>
            <span className='font-bold text-lime-600'>
              {Math.min(hero.spd + 15, 50)}
            </span>
          </span>
          <span className='flex items-center'>
            <span className='text-neutral-300 flex-auto'>Total MP: </span>
            <span className='font-bold text-lime-600'>{hero.fireMpCap}</span>
          </span>
          <span className='flex items-center'>
            <span className='text-neutral-300 flex-auto'>Absorb MP: </span>
            <span className='font-bold text-lime-600'>
              {Math.floor((hero.int - 1) / 3)}
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

// TODO: refactor hero details page so that there will be a common layout for all of these
interface AttributeTileProps {
  attrName: string
  value: number
  children: ReactNode
}

function AttributeTile({ children, attrName, value }: AttributeTileProps) {
  let [referenceElement, setReferenceElement] = useState()
  let [popperElement, setPopperElement] = useState()
  let { styles, attributes } = usePopper(referenceElement, popperElement)

  return (
    <Popover className='relative flex-auto'>
      <Popover.Button
        className={classNames(
          'outline-none w-full flex flex-col items-center justify-center p-2 rounded bg-black/20',
        )}
        ref={setReferenceElement as any}
      >
        <img
          src={`/stat_${attrName}.svg`}
          className='w-10 h-10 aspect-square object-contain'
        />
        <div className='flex justify-center gap-2 items-center'>
          <span className='opacity-50 uppercase'>{attrName}</span>{' '}
          <span className='font-bold'>{value}</span>
        </div>
      </Popover.Button>
      <Popover.Panel
        className='absolute z-50 bg-neutral-800 py-3 px-5 rounded text-xs xl:text-sm shadow'
        ref={setPopperElement as any}
        style={styles.popper}
        {...attributes.popper}
      >
        <div className='w-[200px] flex flex-col'>{children}</div>
      </Popover.Panel>
    </Popover>
  )
}
