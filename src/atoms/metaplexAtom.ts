import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js'
import { atom, useAtomValue } from 'jotai'
import { connectionAtom } from './connectionAtom'
import { userWalletAtom } from './userWalletAtom'

export const metaplexAtom = atom((get) => {
  const connection = get(connectionAtom)
  const wallet = get(userWalletAtom)

  if (wallet?.connected) {
    return Metaplex.make(connection).use(walletAdapterIdentity(wallet))
  }

  return Metaplex.make(connection)
})

export const useMetaplex = () => useAtomValue(metaplexAtom)
