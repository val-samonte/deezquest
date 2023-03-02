'use client'

import { userWalletAtom } from '@/atoms/userWalletAtom'
import { useWallet, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { useAtomValue, useSetAtom } from 'jotai'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import { idbAtom } from '@/atoms/idbAtom'

export default function DependenciesContainer({
  children,
}: {
  children: React.ReactNode
}) {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [])

  return (
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <AtomsInitializer />
        <Suspense fallback={null}>{children}</Suspense>
      </WalletModalProvider>
    </WalletProvider>
  )
}

export function AtomsInitializer() {
  ///////////////////////////
  // PRELOAD IDB
  ///////////////////////////

  useAtomValue(idbAtom)

  ///////////////////////////
  // USER WALLET ATOM
  ///////////////////////////

  const walletContextStateSerialized = useRef('')
  const walletContextState = useWallet()
  const setUserWalletContextState = useSetAtom(userWalletAtom)

  useEffect(() => {
    const serialized = JSON.stringify({
      wallet: walletContextState.wallet?.readyState,
      publicKey: walletContextState.publicKey,
      connected: walletContextState.connected,
      connecting: walletContextState.connecting,
      disconnecting: walletContextState.disconnecting,
    })

    if (walletContextStateSerialized.current !== serialized) {
      walletContextStateSerialized.current = serialized

      setUserWalletContextState(walletContextState)
    }
  }, [walletContextState, setUserWalletContextState])

  return null
}
