'use client'

import { atom } from 'jotai'
import { WalletContextState } from '@solana/wallet-adapter-react'

const baseUserWalletAtom = atom<
  Promise<WalletContextState> | WalletContextState
>(new Promise(() => {}) as Promise<WalletContextState>)

export const userWalletAtom = atom(
  async (get) => {
    return get(baseUserWalletAtom)
  },
  (_, set, update: Promise<WalletContextState> | WalletContextState) => {
    set(baseUserWalletAtom, update)
  },
)
