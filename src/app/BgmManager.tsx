'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import useSound from 'use-sound'

// BGM by https://twitter.com/thenakarada
// - Battle Theme: Grundar
// - Home Theme: Tavern Loop One
// "RPG Victory Fanfare 3 - The Will of Light" By Dylan Kelk

export default function BgmManager() {
  const pathname = usePathname()
  const homeInit = useRef(false)
  const battleInit = useRef(false)

  const [playHome, { sound: homeSound }] = useSound('/bgm_home.ogg', {
    volume: 0.5,
    loop: true,
    interrupt: true,
  })

  const [playBattle, { sound: battleSound }] = useSound('/bgm_battle.ogg', {
    volume: 0.5,
    loop: true,
    interrupt: true,
  })

  useEffect(() => {
    if (homeSound && !homeInit.current) {
      homeSound.on('fade', () => {
        if (homeSound.volume() === 0) {
          homeSound.stop()
        }
      })
      homeInit.current = true
    }
  }, [homeSound])

  useEffect(() => {
    if (battleSound && !battleInit.current) {
      battleSound.on('fade', () => {
        if (battleSound.volume() === 0) {
          battleSound.stop()
        }
      })
      battleInit.current = true
    }
  }, [battleSound])

  // useEffect(() => {
  //   if (pathname && homeInit.current && battleInit.current) {
  //     if (pathname.includes('/battle')) {
  //       if (battleSound && !battleSound.playing()) {
  //         playBattle()
  //         battleSound.fade(battleSound.volume(), 0.5, 1000)
  //       }
  //       if (homeSound && homeSound.playing()) {
  //         homeSound.fade(homeSound.volume(), 0, 1000)
  //       }
  //     } else {
  //       if (homeSound && !homeSound.playing()) {
  //         setTimeout(() => {
  //           playHome()
  //           homeSound.volume(0.5)
  //           // homeSound.fade(homeSound.volume(), 0.5, 1000)
  //         }, 1000)
  //       }
  //       if (battleSound && battleSound.playing()) {
  //         battleSound.fade(battleSound.volume(), 0, 1000)
  //       }
  //     }
  //   }
  // }, [pathname, homeSound, battleSound, playHome, playBattle])

  return null
}
