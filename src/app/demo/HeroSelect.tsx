'use client'

import { Keypair } from '@solana/web3.js'
import { useState } from 'react'

export default function HeroSelect() {
  const [kp, setKp] = useState(Keypair.generate())

  return <div></div>
}

// https://shdw-drive.genesysgo.net/52zh6ZjiUQ5UKCwLBwob2k1BC3KF2qhvsE7V4e8g2pmD/SolanaSpaceman.png
