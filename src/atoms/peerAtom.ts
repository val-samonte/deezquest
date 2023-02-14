import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import Peer from 'peerjs'

export const peerAtom = atomFamily((id: string) => atom(new Peer(id)))
