'use client'

import { useWallet } from '@/atoms/userWalletAtom'
import { trimAddress } from '@/utils/trimAddress'
import { useMemo } from 'react'

export default function WalletButton() {
  const { publicKey, disconnect, openModal } = useWallet()

  const userAddress = useMemo(
    () => (publicKey ? trimAddress(publicKey.toBase58()) : null),
    [publicKey],
  )

  return (
    <button
      type='button'
      className='px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded'
      onClick={() => (publicKey ? disconnect() : openModal())}
    >
      {userAddress ? `Disconnect ${userAddress}` : 'Connect'}
    </button>
  )
}
