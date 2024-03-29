'use client'

import { isXNftAtom } from '@/atoms/isXNftAtom'
import { useMetaplex } from '@/atoms/metaplexAtom'
import { useUserWallet } from '@/atoms/userWalletAtom'
import { Dialog } from '@/components/Dialog'
import WalletGuard from '@/components/WalletGuard'
import { JsonMetadata, Metadata, Nft, Sft } from '@metaplex-foundation/js'
import { PublicKey } from '@solana/web3.js'
import classNames from 'classnames'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { HeroCard } from './HeroCard'
import HeroSelect from './HeroSelect'

interface HeroContentPageProps {
  basePath: string
}

interface NewMintParams {
  address: string
  tx: string
  image: string
}

export const userNftCollectionAtom = atom<(Metadata | Nft | Sft)[]>([])

export default function HeroContentPage({ basePath }: HeroContentPageProps) {
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
    return <WalletGuard />
  }

  return (
    <>
      {collection.length === 0 && listPreloaded ? (
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='w-full max-h-full overflow-auto p-5'>
            <div className='p-5 rounded bg-neutral-900 shadow min-w-min max-w-sm w-full mx-auto  flex flex-col gap-5'>
              <h3 className='text-lg font-bold'>Welcome Adventurer!</h3>
              <p className='text-stone-300'>
                It seems that thou art a new arrival to these parts. Let us
                employ a fresh hero in thine stead!
              </p>
              <p className='text-stone-500 italic text-center'>
                Please make sure you have sufficient SOL in DEVNET.{' '}
                {!isXNft && (
                  <>
                    Visit this{' '}
                    <a
                      href='https://faucet.quicknode.com/solana/devnet'
                      rel='noopener noreferrer'
                      className='underline'
                    >
                      faucet
                    </a>{' '}
                    to get some SOL airdrop.
                  </>
                )}
              </p>
              <button
                type='button'
                className={classNames(
                  'flex-auto px-3 py-2',
                  'flex items-center justify-center',
                  'bg-purple-700 hover:bg-purple-600 rounded',
                )}
                onClick={() => setHeroSelectOpen(true)}
              >
                Hire a Hero
              </button>
            </div>
          </div>
        </div>
      ) : (
        listPreloaded && (
          <div className='absolute inset-0 w-screen sm:w-auto flex-auto overflow-y-auto overflow-x-hidden p-3 xl:p-5'>
            <div className='flex flex-wrap justify-center gap-3 xl:gap-5'>
              {collection.map((nft) => {
                let address
                if (nft.model === 'metadata') {
                  address = (
                    nft as Metadata<JsonMetadata<string>>
                  ).mintAddress.toBase58()
                } else {
                  address = (nft as Nft).mint.address.toBase58()
                }

                return (
                  <HeroCard
                    key={address}
                    basePath={basePath}
                    address={address}
                    uri={nft.uri}
                  />
                )
              })}
              <button
                type='button'
                onClick={() => setHeroSelectOpen(true)}
                className={classNames(
                  'p-3 gap-2 w-40 xl:w-60 aspect-[3/4]',
                  'bg-neutral-900 hover:bg-neutral-800 rounded',
                  'flex flex-col justify-center items-center',
                )}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='w-14 h-14'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M12 4.5v15m7.5-7.5h-15'
                  />
                </svg>
                New Hero
              </button>
            </div>
          </div>
        )
      )}

      <Dialog
        title={'New Hero'}
        show={heroSelectOpen}
        className='max-w-3xl'
        onClose={() => setHeroSelectOpen(false)}
      >
        <HeroSelect
          onMint={(onMintParams) => {
            setNewMintParams(onMintParams)
            setSuccessOpen(true)
            loadNfts()
          }}
        />
      </Dialog>
      <Dialog
        title={'Hired a New Hero!'}
        show={successOpen && !!newMintParams}
        className='max-w-sm'
        onClose={() => setSuccessOpen(false)}
      >
        {newMintParams && (
          <div className='flex flex-col gap-5 px-5'>
            <div className='bg-black/20 w-60 h-60 mx-auto portrait:h-auto aspect-square relative overflow-hidden rounded'>
              <img
                src={newMintParams.image}
                className='w-full h-full object-contain '
              />
            </div>
            <q className='text-center'>
              I am a mercenary of the highest caliber, and my blade is at your
              service.
            </q>
            {!isXNft && (
              <div className='flex items-center justify-between'>
                <a
                  target='_blank'
                  rel='noreferrer'
                  className='underline'
                  href={`https://solscan.io/token/${newMintParams.address}?cluster=devnet`}
                >
                  View Explorer
                </a>
                <a
                  target='_blank'
                  rel='noreferrer'
                  className='underline'
                  href={`https://solscan.io/tx/${newMintParams.tx}?cluster=devnet`}
                >
                  View Transaction
                </a>
              </div>
            )}
            <div className='flex gap-3 justify-center pt-5 border-t border-t-white/5 px-5'>
              <button
                type='button'
                className={classNames(
                  'px-3 py-2 bg-neutral-700 hover:bg-neutral-600 rounded flex items-center',
                )}
                onClick={() => {
                  setSuccessOpen(false)
                }}
              >
                Close
              </button>
              <button
                type='button'
                className={classNames(
                  'flex items-center justify-center',
                  'flex-auto px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded',
                )}
                onClick={() => {
                  setSuccessOpen(false)
                  setHeroSelectOpen(false)
                  router.push(`${basePath}/${newMintParams.address}`)
                }}
              >
                View Hero
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  )
}
