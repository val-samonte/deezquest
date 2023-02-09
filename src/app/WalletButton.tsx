'use client'

import { userWalletAtom } from '@/atoms/userWalletAtom'
import { trimAddress } from '@/utils/trimAddress'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useAtomValue } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { useMemo } from 'react'

export default function WalletButton() {
  useHydrateAtoms([[userWalletAtom, {}]] as any)
  const { setVisible } = useWalletModal()
  const { publicKey, disconnect } = useAtomValue(userWalletAtom)

  const userAddress = useMemo(
    () => (publicKey ? trimAddress(publicKey.toBase58()) : null),
    [publicKey],
  )

  return (
    <button
      className='px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded'
      onClick={() => (publicKey ? disconnect() : setVisible(true))}
    >
      {userAddress ? `Disconnect ${userAddress}` : 'Connect'}
    </button>
  )
}
