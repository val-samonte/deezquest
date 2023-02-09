import { Connection } from '@solana/web3.js'
import { atom } from 'jotai'
import { connectionCommitmentAtom } from './connectionCommitmentAtom'
import { rpcEndpointAtom } from './rpcEndpointAtom'

export const connectionAtom = atom((get) => {
  const endpoint = get(rpcEndpointAtom)
  const commitment = get(connectionCommitmentAtom)

  return new Connection(endpoint, commitment)
})
