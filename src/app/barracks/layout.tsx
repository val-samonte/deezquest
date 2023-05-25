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
import { usePathname } from 'next/navigation'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import {
  gridContainerPosAtom,
  userNftCollectionAtom,
} from '@/atoms/barracksAtoms'
import HeroesGrid from './HeroesGrid'
import classNames from 'classnames'
import HeroPreview from './HeroPreview'
import BackIcon from '@/components/BackIcon'
import Link from 'next/link'

interface NewMintParams {
  address: string
  tx: string
  image: string
}

export default function BarracksLayout({
  children,
}: {
  children: ReactNode | null
}) {
  const wallet = useUserWallet()
  const metaplex = useMetaplex()
  const pathname = usePathname()
  const [listPreloaded, setListPreloaded] = useState(false)
  const [collection, setCollection] = useAtom(userNftCollectionAtom)
  const publicKey = wallet?.publicKey ?? null
  const controller = useRef(new AbortController())
  const isXNft = useAtomValue(isXNftAtom)
  const drilldown = pathname !== '/barracks'

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
          <div
            className={classNames(
              drilldown
                ? 'pointer-events-none opacity-0 ' +
                    'landscape:pointer-events-auto landscape:opacity-100 landscape:pr-96 ' +
                    'portrait:sm:pointer-events-auto portrait:sm:opacity-100 portrait:sm:pr-96'
                : 'pr-5',
              'transition-opacity',
              'absolute inset-0',
              'h-full w-screen sm:w-auto flex-auto overflow-y-scroll overflow-x-hidden py-5 pl-5',
            )}
          >
            <HeroesGrid />
          </div>
          <div
            className={classNames(
              drilldown ? 'mr-0' : '-mr-[100%]',
              'transition-all duration-300',
              'h-full absolute top-0 right-0 bottom-0 pointer-events-none',
            )}
          >
            <div
              className={classNames(
                'w-screen',
                'landscape:w-96 portrait:sm:w-96',
                'h-full flex flex-col bg-gradient-to-r from-black/0 to-black',
              )}
            >
              <div className='flex-auto'>
                <HeroPreview />
              </div>
              <div className='w-full pointer-events-auto pb-5 px-5 overflow-y-scroll gap-5 grid grid-cols-4'>
                <Link
                  href={'/barracks'}
                  className='w-full landscape:hidden portrait:sm:hidden col-span-1 flex gap-2 items-center justify-center'
                >
                  <BackIcon />
                  Back
                </Link>
                <Button className='w-full col-span-3 landscape:col-span-4 portrait:sm:col-span-4'>
                  Mission
                </Button>
              </div>
            </div>
            {/* {children} */}
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
