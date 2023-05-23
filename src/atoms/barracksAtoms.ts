import { Metadata, Nft, Sft } from '@metaplex-foundation/js'
import { atom } from 'jotai'

export const userNftCollectionAtom = atom<(Metadata | Nft | Sft)[]>([])
export const gridContainerPosAtom = atom<{ x: number; y: number } | null>(null)
