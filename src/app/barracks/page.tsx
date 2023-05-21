'use client'

import { isXNftAtom } from '@/atoms/isXNftAtom'
import { useMetaplex } from '@/atoms/metaplexAtom'
import { useUserWallet } from '@/atoms/userWalletAtom'
import Button from '@/components/Button'
import Center from '@/components/Center'
import PageContainer from '@/components/PageContainer'
import PageTitle from '@/components/PageTitle'
import Panel from '@/components/Panel'
import WalletGuard from '@/components/WalletGuard'
import { Metadata, Nft, Sft } from '@metaplex-foundation/js'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

interface NewMintParams {
  address: string
  tx: string
  image: string
}

const userNftCollectionAtom = atom<(Metadata | Nft | Sft)[]>([])

export default function Barracks() {
  const wallet = useUserWallet()
  const metaplex = useMetaplex()
  const router = useRouter()
  const [listPreloaded, setListPreloaded] = useState(false)
  const [heroSelectOpen, setHeroSelectOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [newMintParams, setNewMintParams] = useState<NewMintParams | null>(null)
  const [collection, setCollection] = useAtom(userNftCollectionAtom)
  const publicKey = wallet?.publicKey ?? null
  const controller = useRef(new AbortController())
  const isXNft = useAtomValue(isXNftAtom)

  // TODO: convert this to atom
  const loadNfts = useCallback(async () => {
    if (!publicKey || !metaplex) return

    if (controller.current) {
      controller.current.abort()
      controller.current = new AbortController()
    }

    const nfts = await metaplex
      .nfts()
      .findAllByOwner(
        { owner: publicKey },
        { commitment: 'processed', signal: controller.current.signal },
      )
    setCollection(nfts)
  }, [publicKey, metaplex, setCollection])

  useEffect(() => {
    setCollection([])
    setListPreloaded(false)
    loadNfts().then(() => setListPreloaded(true))
  }, [publicKey, loadNfts, setListPreloaded, setCollection])

  if (!wallet?.connected) {
    return (
      <PageContainer>
        <PageTitle title='Barracks' />
        <WalletGuard />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageTitle title='Barracks' />
      {JSON.stringify(collection)}
    </PageContainer>
  )
}
