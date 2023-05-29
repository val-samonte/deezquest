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
import { useAtom, useAtomValue } from 'jotai'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import {
  barracksPathFlagsAtom,
  userNftCollectionAtom,
} from '@/atoms/barracksAtoms'
import HeroesGrid from './HeroesGrid'
import classNames from 'classnames'
import HeroPreview from './HeroPreview'
import BackIcon from '@/components/BackIcon'
import Image from 'next/image'
import Loadout from './Loadout'

export default function BarracksLayout({
  children,
}: {
  children: ReactNode | null
}) {
  const wallet = useUserWallet()
  const metaplex = useMetaplex()
  const router = useRouter()
  const [listPreloaded, setListPreloaded] = useState(false)
  const [collection, setCollection] = useAtom(userNftCollectionAtom)
  const publicKey = wallet?.publicKey ?? null
  const controller = useRef(new AbortController())
  const isXNft = useAtomValue(isXNftAtom)
  const { segments, level1, level2, level3, mission, loadout } = useAtomValue(
    barracksPathFlagsAtom,
  )

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
        <PageTitle
          key={'barracks_title'}
          title={mission ? 'Mission' : loadout ? 'Loadout' : 'Barracks'}
        />
        <div className='flex-auto relative'>
          <div
            className={classNames(
              level2 ? 'opacity-0 md:opacity-100' : 'opacity-0',
              'pointer-events-none',
              'transition-all duration-300',
              'absolute inset-y-0 w-96 left-0',
              'from-black/0 to-black',
              'bg-gradient-to-l',
            )}
          />
          <div
            className={classNames(
              level3
                ? 'opacity-0 xl:opacity-100'
                : level1 && !level2
                ? 'opacity-100'
                : 'opacity-0',
              'pointer-events-none',
              'transition-all duration-300',
              'absolute inset-y-0 w-96 right-0',
              'from-black/0 to-black',
              'bg-gradient-to-r',
            )}
          />
          <div
            className={classNames(
              level1
                ? 'pointer-events-none opacity-0 landscape:pr-96 portrait:sm:pr-96' +
                    (level2
                      ? ''
                      : ' landscape:pointer-events-auto landscape:opacity-100 ' +
                        'portrait:sm:pointer-events-auto portrait:sm:opacity-100')
                : 'pr-5',
              'transition-opacity duration-500',
              'absolute inset-0',
              'h-full w-screen sm:w-auto flex-auto overflow-y-scroll overflow-x-hidden py-5 pl-5',
            )}
          >
            <HeroesGrid />
          </div>
          <div
            className={classNames(
              'transition-all duration-500',
              level1
                ? level2
                  ? 'ml-0'
                  : 'landscape:ml-[calc(100vw-24rem)] portrait:sm:ml-[calc(100vw-24rem)]'
                : 'ml-[100vw]',

              'flex',
              'h-full relative w-screen pointer-events-none',
            )}
          >
            <div
              className={classNames(
                'w-screen',
                level2
                  ? 'landscape:md:w-96 portrait:md:w-96'
                  : 'landscape:w-96 portrait:sm:w-96',
                'h-full flex-none flex flex-col',
              )}
            >
              <div
                className={classNames(
                  'flex-auto transition-all',
                  level2 &&
                    'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto',
                )}
              >
                <HeroPreview className={classNames(level2 && 'rtl')} />
              </div>
              <div
                className={classNames(
                  level2 && 'md:rtl',
                  'max-w-sm mx-auto',
                  'w-full pointer-events-auto p-5 overflow-y-scroll',
                )}
              >
                <div className='ltr gap-1 grid grid-cols-4'>
                  <button
                    type='button'
                    onClick={() =>
                      router.push(segments.slice(0, level3 ? -2 : -1).join('/'))
                    }
                    className={classNames(
                      !level2 && 'landscape:hidden portrait:sm:hidden',
                      'w-full col-span-1 flex gap-1 items-center justify-start text-sm tracking-widest uppercase',
                    )}
                  >
                    <BackIcon />
                    Back
                  </button>
                  <div
                    className={classNames(
                      'flex items-center',
                      !level2 && 'landscape:col-span-4 portrait:sm:col-span-4',
                      'w-full col-span-3',
                    )}
                  >
                    <Button
                      onClick={() =>
                        router.push(segments.slice(0, 3).join('/') + '/weapon')
                      }
                      className={classNames(
                        loadout && 'hidden',
                        'overflow-hidden px-0',
                        'flex-auto transition-all',
                        'flex items-center justify-center gap-1',
                      )}
                    >
                      <Image
                        alt='Loadout'
                        src='/cmd_support.svg'
                        width={120}
                        height={120}
                        className='h-4 w-4'
                      />
                      Loadout
                    </Button>
                    <div
                      className={classNames(
                        level2 && 'hidden',
                        'aspect-square w-4 border border-amber-400/50 rotate-45',
                      )}
                    />
                    <Button
                      onClick={() =>
                        router.push(segments.slice(0, 3).join('/') + '/mission')
                      }
                      className={classNames(
                        mission && 'hidden',
                        'overflow-hidden px-0',
                        'flex-auto transition-all',
                        'flex items-center justify-center gap-1',
                      )}
                    >
                      <Image
                        alt='Mission'
                        src='/BattleIcon.svg'
                        width={41}
                        height={41}
                        className='h-4 w-4'
                      />
                      Mission
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Loadout />
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
