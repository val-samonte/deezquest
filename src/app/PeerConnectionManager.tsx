'use client'

import bs58 from 'bs58'
import classNames from 'classnames'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'

import { PeerErrorType, usePeer } from '@/atoms/peerAtom'
import {
  connectionListAtom,
  peerAtom,
  peerIdAtom,
  peerKeypairAtom,
  peerNonceAtom,
  peerOpenAtom,
  renewEnabledAtom,
} from '@/atoms/peerConnectionAtom'
import Dialog from '@/components/Dialog'
import Button from '@/components/Button'

// Peer Connection:
// for p2p, we need another nonce as well, which is colocated in the same PDA with
// the burner nonce. eg.

// See: peerConnectionAtom

// opponent simply needs to listen to the PDA account for any p2p_nonce changes OR
// the player can submit another ping message to the opponent, making the opponent dismiss the old peer connection.
// as long as the player can sign the message using the burner account, opponent can always verify
// the authencity of the message.

// Accepting Match:
// if both parties agreed to start the match (in p2p), both will exchange the code solution
// to solve each respective code challenge stored in the "MatchAccountPDA"

export default function PeerConnectionManager() {
  const [showReloadModal, setShowReloadModal] = useState(false)
  const renewEnabled = useAtomValue(renewEnabledAtom)
  const keypair = useAtomValue(peerKeypairAtom)
  const peerId = useAtomValue(peerIdAtom)
  const isOpen = useAtomValue(peerOpenAtom)
  const connections = useAtomValue(connectionListAtom)
  const setNonce = useSetAtom(peerNonceAtom)
  const setInstance = useSetAtom(peerAtom)
  const peerInstance = usePeer({
    peerId,
    keypair,
    onError: (err) => {
      if (err.type === PeerErrorType.UnavailableID) {
        setShowReloadModal(true)
      }
    },
  })

  useEffect(() => {
    if (isOpen) {
      setShowReloadModal(false)
      setInstance(peerInstance)
    } else {
      setInstance(null)
    }
  }, [isOpen, peerInstance, setShowReloadModal, setInstance])

  useEffect(() => {
    // TODO: listen to PDA p2p nonce, update peerNonce accdgly
    setNonce((nonce) => {
      if (nonce) return nonce
      return bs58.encode(window.crypto.getRandomValues(new Uint8Array(16)))
    })
  }, [setNonce])

  useEffect(() => {
    if (!connections) return
    console.log('Connections length', connections.length)
  }, [connections])

  return (
    <Dialog show={showReloadModal && !!keypair} className='max-w-sm'>
      <p className='text-center p-5'>
        There is an issue with your peer connection. If you are playing from
        another device, please close the game from that device first then press{' '}
        <span className='font-bold'>Reload</span>.{' '}
        {renewEnabled && (
          <>
            Otherwise press <span className='font-bold'>Renew</span> to create a
            new connection.
          </>
        )}
      </p>
      <div className='flex-auto' />
      <div className='flex gap-3 justify-center p-5'>
        {renewEnabled && (
          <Button
            onClick={() => {
              // TODO: renew
            }}
          >
            Renew
          </Button>
        )}
        <Button
          className='flex-auto'
          onClick={() => {
            window.location.reload()
          }}
        >
          Reload
        </Button>
      </div>
    </Dialog>
  )
}
