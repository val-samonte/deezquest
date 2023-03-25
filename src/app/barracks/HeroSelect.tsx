import { SkillTypes } from '@/enums/SkillTypes'
import { clusterApiUrl, Connection, Keypair, PublicKey } from '@solana/web3.js'
import SkillView from '@/components/SkillView'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getHeroAttributes, skills } from '@/utils/gameFunctions'
import { useMetaplex } from '@/atoms/metaplexAtom'
import { nftCollections } from './nft_collections'
import { JsonMetadata, Metaplex } from '@metaplex-foundation/js'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import classNames from 'classnames'
import SpinnerIcon from '@/components/SpinnerIcon'
import HeroRollDisplay from './HeroRollDisplay'

interface HeroSelectProps {
  onMint: (params: { address: string; tx: string; image: string }) => void
}

export default function HeroSelect({ onMint }: HeroSelectProps) {
  const [mintKeypair, setMintKeypair] = useState(Keypair.generate())
  const metaplex = useMetaplex()
  const [uri, setUri] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<JsonMetadata | null>(null)
  const [busy, setBusy] = useState(false)
  const controller = useRef(new AbortController())

  const stats = useMemo(() => {
    const attribs = getHeroAttributes(mintKeypair.publicKey)
    const bytes = mintKeypair.publicKey.toBytes()
    const availableSkills = {
      [SkillTypes.ATTACK]: skills[bytes[0] % 4],
      [SkillTypes.SUPPORT]: skills[(bytes[1] % 4) + 4],
      [SkillTypes.SPECIAL]: skills[(bytes[2] % 4) + 8],
    }

    return {
      attributes: {
        int: attribs[0],
        spd: attribs[1],
        vit: attribs[2],
        str: attribs[3],
      },
      skills: availableSkills,
    }
  }, [mintKeypair])

  useEffect(() => {
    if (!metaplex) return
    if (!mintKeypair) return

    const demoAddress =
      nftCollections[Math.floor(Math.random() * nftCollections.length)]

    setUri(null)
    setMetadata(null)

    if (controller.current) {
      controller.current.abort()
      controller.current = new AbortController()
    }

    Metaplex.make(
      new Connection(
        process.env.NEXT_PUBLIC_MAINNET ??
          clusterApiUrl(WalletAdapterNetwork.Mainnet),
      ),
    )
      .nfts()
      .findByMint(
        {
          mintAddress: new PublicKey(demoAddress),
        },
        {
          signal: controller.current.signal,
        },
      )
      .then((mint) => {
        setUri(mint.uri)
        return fetch(`/api/proxy_json?uri=${encodeURIComponent(mint.uri)}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.current.signal,
        })
      })
      .then((response) => response.json())
      .then((metadata) => setMetadata(metadata))
      .catch(() => {})

    return () => {
      controller.current.abort()
    }
  }, [mintKeypair, metaplex, setMetadata, setUri])

  const mint = useCallback(async () => {
    if (!uri || !metadata || busy) return

    setBusy(true)

    try {
      const output = await metaplex.nfts().create(
        {
          useNewMint: mintKeypair,
          name: metadata.name ?? 'Sample Hero',
          sellerFeeBasisPoints: metadata.seller_fee_basis_points ?? 420,
          uri,
        },
        { commitment: 'confirmed' },
      )

      onMint({
        address: mintKeypair.publicKey.toBase58(),
        image: metadata.image ?? '',
        tx: output.response.signature,
      })

      controller.current.abort()
      setMintKeypair(Keypair.generate())
    } catch (e) {
      // TODO: error here
    }

    setBusy(false)
  }, [mintKeypair, metaplex, uri, metadata, setBusy, setMintKeypair])

  return (
    <div className='flex flex-col max-w-3xl gap-5 mx-auto px-5 bg-neutral-900 rounded'>
      <HeroRollDisplay publicKey={mintKeypair.publicKey}>
        {metadata ? (
          <>
            <img
              src={metadata.image}
              className='w-full h-full object-contain'
            />
            <div className='absolute inset-x-0 bottom-0 text-center font-bold text-xl bg-red-600/80 text-white'>
              DUMMY NFT ONLY
            </div>
          </>
        ) : (
          <div className='flex items-center justify-center absolute inset-0'>
            <SpinnerIcon />
          </div>
        )}
      </HeroRollDisplay>
      <div className='flex gap-3 justify-center pt-5 border-t border-t-white/5 px-5'>
        <button
          type='button'
          disabled={busy}
          className={classNames(
            busy && 'opacity-20',
            'px-3 py-2 bg-neutral-700 hover:bg-neutral-600 rounded',
          )}
          onClick={() => {
            controller.current.abort()
            setMintKeypair(Keypair.generate())
          }}
        >
          Reroll
        </button>
        <button
          type='button'
          disabled={!uri || !metadata || busy}
          className={classNames(
            (!uri || !metadata || busy) && 'opacity-20',
            'portrait:flex-auto px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded flex items-center justify-center',
          )}
          onClick={() => mint()}
        >
          {busy ? (
            <>
              <SpinnerIcon />
              <span className='ml-2'>Minting your hero</span>
            </>
          ) : (
            'Mint NFT'
          )}
        </button>
      </div>
    </div>
  )
}
