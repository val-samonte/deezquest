'use client'

import { getHeroAttributes } from '@/utils/getHeroAttributes'
import { trimAddress } from '@/utils/trimAddress'
import { Keypair } from '@solana/web3.js'
import { useEffect, useRef } from 'react'

export default function SpeedDemo() {
  const done = useRef(false)
  useEffect(() => {
    if (done.current) return

    // for (let i = 0; i < 100; i++) {
    //   const kp = Keypair.generate()
    //   const attribs = getPlayerAttributes(kp.publicKey)
    //   console.log(trimAddress(kp.publicKey.toBase58()), JSON.stringify(attribs))
    // }

    // for (let i = 0; i <= 10; i++) {
    //   for (let j = i + 1; j <= 10; j++) {
    //     getSpeedResult(i + 20, j + 20)
    //   }
    // }

    done.current = true
  }, [])

  return null
}

function getSpeedResult(
  attr1: number[],
  attr2: number[],
  spd1: number,
  spd2: number,
) {
  let tt1 = 0
  let tt2 = 0

  let cnt1 = 0
  let cnt2 = 0

  for (let i = 0; cnt1 + cnt2 < 100; i++) {
    if (tt1 >= 100 && tt2 >= 100) {
      if (tt1 > tt2) {
        // console.log('Player 1 turn')
        tt1 -= 100
        cnt1++
      } else if (tt2 >= tt1) {
        // console.log('Player 2 turn')
        tt2 -= 100
        cnt2++
      } else {
        // console.log('both players will do turns in this loop')
        // priority:
        // compare base speed
        // compare base strength
      }

      continue
    } else {
      if (tt1 >= 100) {
        // console.log('Player 1 turn')
        tt1 -= 100
        cnt1++
      } else if (tt2 >= 100) {
        // console.log('Player 2 turn')
        tt2 -= 100
        cnt2++
      }
    }
    tt1 += spd1
    tt2 += spd2
  }

  console.log(spd1, spd2, cnt1 + ':' + cnt2)
}

// Final Fantasy Tactics speed (Charge Time)
// Speed determines how often a unit gets a turn. Every tick, each character's CT increases by their Speed
// (for example, a character with 10 Speed has their CT increase by 10, a character with 3 increases
//   their CT by 3, etc.). When the CT reaches 100, that character gets a turn.
//   Speed maxes out at 50, as it is useless to have a Speed greater than it since the
//   character will get a turn in two ticks anyway.
