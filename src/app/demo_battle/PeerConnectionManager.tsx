'use client'

import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { usePeer } from '@/atoms/peerAtom'
import { PeerMessages } from '@/enums/PeerMessages'
import { sleep } from '@/utils/sleep'

export default function PeerConnectionManager() {
  const router = useRouter()
  const [kp] = useState(
    (localStorage.getItem('demo_kp') &&
      Keypair.fromSecretKey(bs58.decode(localStorage.getItem('demo_kp')!))) ||
      null,
  )
  const [opponent] = useState(localStorage.getItem('demo_opponent') || null)
  const { isOpen, connections, sendMessage } = usePeer(kp!)

  // kick player with no keypair and opponent
  useEffect(() => {
    if (!kp || !opponent) {
      sessionStorage.clear()
      router.push('/demo')
    }
  }, [kp, opponent])

  // TODO: maintain activeness of the peer

  // maintain peer connection to the opponent

  const retrying = useRef(false)
  useEffect(() => {
    if (!isOpen) return

    const opponentActive = connections.find((conn) => conn.peer === opponent)

    if (!opponentActive) {
      const ping = async () => {
        retrying.current = true
        while (retrying.current) {
          try {
            if (opponent) {
              await sendMessage(opponent, { type: PeerMessages.PING })
            }
            retrying.current = false
          } catch (err: any) {
            if (err.type !== 'peer-unavailable') {
              retrying.current = false
              throw err
            }
          }

          await sleep(1000)
        }
      }
      !retrying.current && ping()
    }
  }, [isOpen, connections, opponent, sendMessage])

  return null
}
