'use client'

import { useWallet } from '@/atoms/userWalletAtom'
import { Keypair } from '@solana/web3.js'
import { atom, useAtom } from 'jotai'
import { useCallback, useState } from 'react'

const isSSR = typeof window === 'undefined'

const burnerNameBaseAtom = atom(
  isSSR ? null : localStorage.getItem('burnerName') ?? null,
)
const burnerNameAtom = atom(
  (get) => get(burnerNameBaseAtom),
  (_, set, value: string | null) => {
    if (!isSSR) {
      if (value) {
        localStorage.setItem('burnerName', value)
      } else {
        localStorage.removeItem('burnerName')
      }
    }
    set(burnerNameBaseAtom, value)
  },
)

const burnerAccountAtom = atom<Keypair | null>(null)

export default function BurnerWalletDemo() {
  const { signMessage, publicKey } = useWallet()
  const [burnerName, setBurnerName] = useAtom(burnerNameAtom)
  const [burnerAccount, setBurnerAccount] = useAtom(burnerAccountAtom)
  const [input, setInput] = useState(burnerName ?? '')

  const getKeypair = useCallback(
    async (name: string) => {
      if (!signMessage) return
      if (!name) return
      setBurnerName(name)

      const message = await signMessage(Buffer.from(name, 'utf8'))
      const kp = Keypair.fromSeed(message.slice(32))

      setBurnerAccount(kp)
    },
    [signMessage, setBurnerName],
  )

  if (!publicKey) return null

  return (
    <div className='flex items-center gap-3'>
      {burnerName ? (
        <>
          <div className='flex flex-col justify-center'>
            <h3 className='text-lg'>{burnerName}</h3>
            <p className='text-sm opacity-80'>
              {burnerAccount
                ? burnerAccount.publicKey.toBase58()
                : 'Needs signature'}
            </p>
          </div>
          <button
            type='button'
            className='px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded'
            onClick={() => {
              if (burnerAccount) {
                setBurnerName(null)
                setBurnerAccount(null)
              } else {
                getKeypair(input)
              }
            }}
          >
            {burnerAccount ? 'Remove' : 'Sign'}
          </button>
        </>
      ) : (
        <>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type='text'
            autoFocus
            className='px-3 py-2 rounded bg-neutral-800'
            placeholder='Enter burner account name'
          />
          <button
            type='button'
            className='px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded'
            onClick={() => getKeypair(input)}
          >
            Get Keypair
          </button>
        </>
      )}
    </div>
  )
}
