import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { clusterApiUrl } from '@solana/web3.js'
import { atom } from 'jotai'

export const rpcEndpointAtom = atom(
  process.env.NEXT_PUBLIC_CLUSTER ?? clusterApiUrl(WalletAdapterNetwork.Devnet),
)
