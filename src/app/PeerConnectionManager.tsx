'use client'

import { usePeer } from '@/atoms/peerAtom'
import { getNextHash } from '@/utils/getNextHash'
import { atom, useAtomValue } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import { burnerKeypairAtom } from './BurnerAccountManager'
import bs58 from 'bs58'
import { useEffect, useState } from 'react'
import { Dialog } from '@/components/Dialog'
import classNames from 'classnames'
import { PeerErrorType } from 'peerjs'

// Peer Connection:
// NOTE: STORING THE NONCE IS NOT REQUIRED DURING FRIENDLY MATCHES
// for p2p, we need another nonce as well, which is colocated in the same PDA with
// the burner nonce. eg.

export const peerNonceAtom = atomWithStorage<string | null>(
  'peer_nonce',
  null,
  createJSONStorage<string | null>(() => window.localStorage),
)

export const peerIdAtom = atom((get) => {
  const kp = get(burnerKeypairAtom)
  const nonce = get(peerNonceAtom)
  return kp && nonce
    ? bs58.encode(getNextHash([kp.publicKey.toBytes(), Buffer.from(nonce)]))
    : null
})

export const renewEnabledAtom = atom(false)

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
  const burner = useAtomValue(burnerKeypairAtom)
  const peerId = useAtomValue(peerIdAtom)
  const { peer, isOpen } = usePeer({
    peerId,
    keypair: burner,
    onError: (err) => {
      if (err.type === PeerErrorType.UnavailableID) {
        setShowReloadModal(true)
      }
    },
  })

  useEffect(() => {
    setShowReloadModal(false)
  }, [isOpen, setShowReloadModal])

  // TODO: listen to PDA p2p nonce, update peerNonce accdgly

  return (
    <Dialog show={showReloadModal && !!burner} className='max-w-sm'>
      <p className='text-center px-5 mb-5'>
        There is an issue with your peer connection. If you're playing from
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
      <div className='flex gap-3 justify-center pt-5 border-t border-t-white/5'>
        <button
          type='button'
          className={classNames(
            'px-3 py-2 bg-neutral-700 hover:bg-neutral-600 rounded flex items-center',
          )}
          onClick={() => {
            // TODO: renew
          }}
        >
          Renew
        </button>
        <button
          type='button'
          className={classNames(
            'flex items-center justify-center',
            'flex-auto px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded',
          )}
          onClick={() => {
            // window.location.reload()
          }}
        >
          Reload
        </button>
      </div>
    </Dialog>
  )
}
