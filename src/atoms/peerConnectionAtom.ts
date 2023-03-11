import { burnerKeypairAtom } from '@/app/BurnerAccountManager'
import { getNextHash } from '@/utils/getNextHash'
import { atom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import bs58 from 'bs58'
import { PeerInstance } from './peerAtom'

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

// TODO: lots of things to refactor here
export const peerAtom = atom<PeerInstance | null>(null)
