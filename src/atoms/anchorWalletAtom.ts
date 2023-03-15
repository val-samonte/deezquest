import { atom } from 'jotai'
import { userWalletAtom } from './userWalletAtom'

export const anchorWalletAtom = atom((get) => {
  const wallet = get(userWalletAtom)

  if (
    !wallet?.publicKey ||
    !wallet?.signTransaction ||
    !wallet?.signAllTransactions
  ) {
    return null
  }

  return {
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction,
    signAllTransactions: wallet.signAllTransactions,
  }
})
