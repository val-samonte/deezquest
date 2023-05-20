import { hashv } from '@/utils/hashv'
import { atom } from 'jotai'
import { atomFamily, atomWithStorage, createJSONStorage } from 'jotai/utils'
import bs58 from 'bs58'
import { PeerInstance } from './peerAtom'
import Peer, { DataConnection } from 'peerjs'
import { burnerKeypairAtom } from './burnerKeypairAtom'

export const peerNonceAtom = atomWithStorage<string | null>(
  'peer_nonce',
  null,
  createJSONStorage<string | null>(() => window.localStorage),
)

export const peerIdAtom = atom((get) => {
  const kp = get(burnerKeypairAtom)
  const nonce = get(peerNonceAtom)
  return kp && nonce
    ? bs58.encode(hashv([kp.publicKey.toBytes(), bs58.decode(nonce)]))
    : null
})

export const renewEnabledAtom = atom(false)
export const peerAtom = atom<PeerInstance | null>(null)

export interface PeerMessage {
  from: string // base58 encoded
  data: any
  signature: string // base58 encoded
}

export const messagesAtom = atom<PeerMessage[]>([])

export const peerListAtom = atomFamily((id: string) => atom<Peer | null>(null))
export const peerOpenAtom = atom(false)
export const connectionListAtom = atom<DataConnection[]>([])
