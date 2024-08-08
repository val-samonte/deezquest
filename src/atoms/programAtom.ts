import { AnchorWallet } from '@solana/wallet-adapter-react'
import {
  Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js'
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { atom } from 'jotai'
import { connectionAtom } from './connectionAtom'
import { Deezquest } from '@/types/deezquest'
import idl from '@/idl/deezquest.json'
import { anchorWalletAtom } from './anchorWalletAtom'

export class KeypairWallet implements AnchorWallet {
  constructor(readonly payer: Keypair) {}

  async signTransaction<T extends Transaction | VersionedTransaction>(
    tx: T,
  ): Promise<T> {
    if (tx instanceof Transaction) {
      tx.partialSign(this.payer)
    }

    return tx
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(
    txs: T[],
  ): Promise<T[]> {
    return txs.map((tx) => {
      if (tx instanceof Transaction) {
        tx.partialSign(this.payer)
      }
      return tx
    })
  }

  get publicKey(): PublicKey {
    return this.payer.publicKey
  }
}

export const programAtom = atom((get) => {
  console.log('programAtom')

  const wallet = get(anchorWalletAtom)
  const connection = get(connectionAtom)
  const dummyWallet = new KeypairWallet(Keypair.generate())

  const provider = new AnchorProvider(
    connection,
    (wallet ?? dummyWallet) as any,
    AnchorProvider.defaultOptions(),
  )

  return new Program<Deezquest>(
    idl as unknown as Deezquest,
    process.env.NEXT_PUBLIC_DEEZQUEST_PROGRAM_ID ?? '',
    provider,
  )
})
