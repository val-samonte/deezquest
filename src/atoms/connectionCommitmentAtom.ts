import { Commitment, ConnectionConfig } from '@solana/web3.js'
import { atom } from 'jotai'

export const connectionCommitmentAtom = atom<
  Commitment | ConnectionConfig | undefined
>('confirmed')
