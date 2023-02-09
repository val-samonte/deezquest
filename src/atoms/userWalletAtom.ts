'use client'

import { atom, useAtomValue } from 'jotai'
import { WalletContextState } from '@solana/wallet-adapter-react'
import { useHydrateAtoms } from 'jotai/utils'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

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

export const useWallet = () => {
  useHydrateAtoms([[userWalletAtom, {}]] as any)
  const { setVisible } = useWalletModal()
  const wallet = useAtomValue(userWalletAtom)
  return {
    ...wallet,
    openModal: () => setVisible(true),
  }
}
