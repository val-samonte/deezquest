'use client'

import { userWalletAtom } from '@/atoms/userWalletAtom'
import { useWallet, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { useSetAtom } from 'jotai'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import {
  BackpackIframeAdapter,
  BackpackIframeWalletName,
} from '@/adapter/BackpackIframeAdapter'
import { isXNftAtom } from '@/atoms/isXNftAtom'

// import { idbAtom } from '@/atoms/idbAtom'

export default function DependenciesContainer({
  children,
}: {
  children: React.ReactNode
}) {
  const [backpack, setBackpack] = useState<BackpackIframeAdapter | null>(null)
  const wallets = useMemo(() => (backpack ? [backpack] : []), [backpack])

  useEffect(() => {
    try {
      BackpackIframeAdapter.make().then((backpack) => setBackpack(backpack))
    } catch (e) {
      console.log(e)
    }
  }, [setBackpack])

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

  // useAtomValue(idbAtom)

  ///////////////////////////
  // USER WALLET ATOM
  ///////////////////////////

  const walletContextStateSerialized = useRef('')
  const walletContextState = useWallet()
  const setUserWalletContextState = useSetAtom(userWalletAtom)
  const setIsXNft = useSetAtom(isXNftAtom)

  useEffect(() => {
    // If wallet is disconnected, always check if
    // Backpack Iframe is present, then auto select it
    const backpackIframe = walletContextState.wallets.find(
      (w) => w.adapter.name === BackpackIframeWalletName,
    )
    setIsXNft(!!backpackIframe)

    if (
      backpackIframe &&
      (!walletContextState.connected ||
        walletContextState.wallet?.adapter.name !== BackpackIframeWalletName)
    ) {
      walletContextState.select(BackpackIframeWalletName)
      return
    }

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
  }, [walletContextState, setUserWalletContextState, setIsXNft])

  return null
}
