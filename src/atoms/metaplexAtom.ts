import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js'
import { atom } from 'jotai'
import { connectionAtom } from './connectionAtom'
import { userWalletAtom } from './userWalletAtom'

export const metaplexAtom = atom(async (get) => {
  const connection = get(connectionAtom)
  const wallet = await get(userWalletAtom)

  if (wallet.connected) {
    return Metaplex.make(connection).use(walletAdapterIdentity(wallet))
  }

  return Metaplex.make(connection)
})
