import { JsonMetadata, Metadata, Nft, Sft } from '@metaplex-foundation/js'
import { atom } from 'jotai'
import { pathnameAtom } from './pathnameAtom'

export const userNftCollectionAtom = atom<(Metadata | Nft | Sft)[]>([])
export const gridContainerPosAtom = atom<{ top: number; left: number } | null>(
  null,
)
export const selectedNftAtom = atom<{
  address: string
  metadata: JsonMetadata
} | null>(null)

export const flagsAtom = atom((get) => {
  const pathname = get(pathnameAtom)

  const level1 = pathname !== '/heroes'
  const loadout = pathname.includes('/loadout')
  const mission = pathname.includes('/mission')
  const level2 = loadout || mission
  // future updates - we need to check the NFT using the address
  const weapon = pathname.includes('/unarmed')
  const armor = pathname.includes('/noarmor')
  const accessory = pathname.includes('/noaccessory')
  const items = pathname.includes('/items')
  const level3 = weapon || armor || accessory || items

  return {
    level1, // show hero preview
    level2, // show mission / loadout
    level3, // show item NFT details panel
    mission,
    loadout,
    weapon,
    armor,
    accessory,
    items,
  }
})
