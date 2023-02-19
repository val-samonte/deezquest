import { atom } from 'jotai'

export const stageDimensionAtom = atom({ width: 0, height: 0 })

export const tileSizeAtom = atom((get) => get(stageDimensionAtom).width / 8)

export const isPortraitAtom = atom(false)
