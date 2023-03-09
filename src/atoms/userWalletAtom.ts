'use client'

import { atom, useAtomValue } from 'jotai'
import { WalletContextState } from '@solana/wallet-adapter-react'
// import { useHydrateAtoms } from 'jotai/utils'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useMemo } from 'react'

// const baseUserWalletAtom = atom<
//   Promise<WalletContextState> | WalletContextState
// >(
//   new Promise((_, reject) => {
//     setTimeout(() => reject(), 3000)
//   }) as Promise<WalletContextState>,
// )

// export const userWalletAtom = atom(
//   async (get) => {
//     return await get(baseUserWalletAtom)
//   },
//   (_, set, update: Promise<WalletContextState> | WalletContextState) => {
//     set(baseUserWalletAtom, update)
//   },
// )

export const userWalletAtom = atom<WalletContextState | null>(null)

export const useWallet = () => {
  // useHydrateAtoms([[userWalletAtom, {}]] as any)

  const { setVisible } = useWalletModal()
  const wallet = useAtomValue(userWalletAtom)
  return useMemo(
    () => ({
      ...wallet,
      openModal: () => setVisible(true),
    }),
    [wallet, setVisible],
  )
}

export const useUserWallet = () => useAtomValue(userWalletAtom)
