'use client'

import { isXNftAtom } from '@/atoms/isXNftAtom'
import { useMetaplex } from '@/atoms/metaplexAtom'
import { useUserWallet } from '@/atoms/userWalletAtom'
import Button from '@/components/Button'
import Center from '@/components/Center'
import PageContainer from '@/components/PageContainer'
import PageTitle from '@/components/PageTitle'
import Panel from '@/components/Panel'
import PreloaderAnimation from '@/components/PreloaderAnimation'
import WalletGuard from '@/components/WalletGuard'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import {
  gridContainerPosAtom,
  userNftCollectionAtom,
} from '@/atoms/barracksAtoms'
import HeroesGrid from './HeroesGrid'

interface NewMintParams {
  address: string
  tx: string
  image: string
}

export default function BarracksLayout({ children }: { children: ReactNode }) {
  const wallet = useUserWallet()
  const metaplex = useMetaplex()
  const router = useRouter()
  const [listPreloaded, setListPreloaded] = useState(false)
  const [collection, setCollection] = useAtom(userNftCollectionAtom)
  const publicKey = wallet?.publicKey ?? null
  const controller = useRef(new AbortController())
  const isXNft = useAtomValue(isXNftAtom)
  const setContainerPos = useSetAtom(gridContainerPosAtom)

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

  const container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onResize = () => {
      setContainerPos((pos) => {
        if (container.current) {
          const pos = container.current.getBoundingClientRect()
          const newPos = {
            x: pos.left,
            y: pos.top,
          }

          return newPos
        }
        return pos
      })
    }
    window.addEventListener('resize', onResize)

    const intId = window.setInterval(() => {
      if (container.current) {
        onResize()
        window.clearInterval(intId)
      }
    })

    return () => {
      window.removeEventListener('resize', onResize)
      window.clearInterval(intId)
    }
  }, [setContainerPos])

  if (!wallet?.connected) {
    return (
      <PageContainer key={'barracks_container'}>
        <PageTitle key={'barracks_title'} title='Barracks' />
        <WalletGuard />
      </PageContainer>
    )
  }

  if (collection.length === 0 && listPreloaded) {
    return (
      <PageContainer key={'barracks_container'}>
        <PageTitle key={'barracks_title'} title='Barracks' />
        <Center>
          <Panel className='max-w-sm w-full' title='Welcome'>
            <div className='overflow-auto h-full relative'>
              <p className='px-5 my-5 text-center'>
                It seems that thou art a new arrival to these parts. Let us
                employ a fresh hero in thine stead!
              </p>
              <p className='px-5 my-5 text-center text-stone-500 italic'>
                Please make sure you have sufficient SOL in DEVNET.{' '}
                {!isXNft && (
                  <>
                    Visit this{' '}
                    <a
                      href='https://faucet.quicknode.com/solana/devnet'
                      rel='noopener noreferrer'
                      className='underline'
                      target='_blank'
                    >
                      faucet
                    </a>{' '}
                    to get some SOL airdrop.
                  </>
                )}
              </p>
              <div className='p-5 flex justify-center sticky bottom-0'>
                <Button>Hire a Hero</Button>
              </div>
            </div>
          </Panel>
        </Center>
      </PageContainer>
    )
  }

  if (listPreloaded) {
    return (
      <PageContainer key={'barracks_container'}>
        <PageTitle key={'barracks_title'} title='Barracks' />
        <div className='flex-auto relative'>
          <div className='absolute inset-0 h-full w-screen sm:w-auto flex-auto overflow-y-auto overflow-x-visible py-5 pl-5 pr-96'>
            <HeroesGrid />
          </div>
          <div className='h-full absolute top-0 right-0 bottom-0 w-96 p-5 pointer-events-none'>
            <div className='h-full flex flex-col gap-5'>
              <div className='h-96'>
                <></>
              </div>
              <Panel title='Equip' className='bg-black/50'>
                <></>
              </Panel>
              <div className='w-full pointer-events-auto'>
                <Button className='w-full'>Mission</Button>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer key={'barracks_container'}>
      <PageTitle key={'barracks_title'} title='Barracks' />
      <PreloaderAnimation />
    </PageContainer>
  )
}
