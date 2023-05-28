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

// TODO: needs refactor
export const barracksPathFlagsAtom = atom((get) => {
  const pathname = get(pathnameAtom)
  const segments = pathname.split('/')

  const level1 = pathname !== '/heroes'
  const mission = pathname.includes('/mission')
  const weapon = pathname.includes('/weapon')
  const armor = pathname.includes('/armor')
  const accessory = pathname.includes('/accessory')
  const items = pathname.includes('/items')
  const loadout = weapon || armor || accessory || items
  const level2 = loadout || mission
  const level3 = level2 && segments.length === 5

  return {
    level1, // show hero preview
    level2, // show mission / loadout
    level3, // item details
    mission,
    loadout,
    weapon,
    armor,
    accessory,
    items,
  }
})
