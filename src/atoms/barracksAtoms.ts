import { Metadata, Nft, Sft } from '@metaplex-foundation/js'
import { atom } from 'jotai'

export const userNftCollectionAtom = atom<(Metadata | Nft | Sft)[]>([])
export const gridContainerPosAtom = atom<{ top: number; left: number } | null>(
  null,
)
