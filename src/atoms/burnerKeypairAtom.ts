import { Keypair } from '@solana/web3.js'
import { atom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'

// Backend (Dapp) Seed:
// to strengthen the security, an extra seed is given by the backend so that no other dapps
// can derive the burner account.

interface DappSeed {
  publicKey: string
  nonce: string
}
export const dappSeedAtom = atomWithStorage<DappSeed | null>(
  'dapp_seed',
  null,
  createJSONStorage<DappSeed | null>(() => window.sessionStorage),
)

// Burner Account:
// acts as player proxy needed for seamless interaction.
// when the need for on-chain transaction is necessary (eg. funding the burner account)
// we have to save the nonce on-chain so that we can still derive the burner account.

export const burnerNonceAtom = atomWithStorage<string | null>(
  'burner_nonce',
  null,
  createJSONStorage<string | null>(() => window.localStorage),
)
export const burnerKeypairAtom = atom<Keypair | null>(null)
