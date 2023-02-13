import { atom } from 'jotai'
import crypto from 'crypto'
import { GameTransitions } from '@/constants/GameTransitions'

export const gameHashAtom = atom(
  crypto.createHash('sha256').update(Buffer.from('')).digest(),
)

export const gameTurnCountAtom = atom(0)

export const gameTransitionStackAtom = atom<any[]>([])
export const gameTransitionStackCounterAtom = atom(0)

export const gameFunctions = atom(
  null,
  (get, set, action: { type: string; data?: any }) => {
    let stackCounter = get(gameTransitionStackCounterAtom)
    let hash = get(gameHashAtom)

    switch (action.type) {
      case 'initialBoard': {
        let hash = crypto
          .createHash('sha256')
          .update(Buffer.from(action.data.seed))
          .digest()
        let tiles = new Array(64)
        let iter = 0

        while (true) {
          tiles = hashToTiles(hash)

          if (!hasMatch(tiles)) {
            console.log(iter, hash.toString('hex'))
            break
          }

          iter++
          hash = crypto.createHash('sha256').update(hash).digest()
        }

        stackCounter++
        set(gameTransitionStackAtom, [
          {
            type: GameTransitions.LOAD,
            order: stackCounter,
            tiles,
          },
        ])
        set(gameTransitionStackCounterAtom, stackCounter)
        set(gameHashAtom, hash)

        break
      }
      case 'swapNode': {
        const stack = get(gameTransitionStackAtom)
        const tiles = stack[stack.length - 1].tiles

        const node1 = action.data.node1.y * 8 + action.data.node1.x
        const node2 = action.data.node2.y * 8 + action.data.node2.x

        if (tiles[node1] === null || tiles[node2] === null) return

        let newTiles = [...tiles]
        newTiles[node1] = tiles[node2]
        newTiles[node2] = tiles[node1]

        stack.push({
          type: GameTransitions.SWAP,
          order: ++stackCounter,
          tiles: [...newTiles],
          nodes: {
            node1: {
              ...action.data.node1,
              id: node1,
            },
            node2: {
              ...action.data.node2,
              id: node2,
            },
          },
        })

        while (hasMatch(newTiles)) {
          const { matches, depths } = getMatches(newTiles)

          newTiles = subtract(newTiles, matches)
          stack.push({
            type: GameTransitions.DRAIN,
            order: ++stackCounter,
            tiles: newTiles,
          })

          // todo: patch hole

          newTiles = applyGravity(newTiles, depths)

          stack.push({
            type: GameTransitions.FILL,
            order: ++stackCounter,
            tiles: [...newTiles],
          })
        }

        set(gameTransitionStackAtom, [...stack])
        break
      }
    }

    set(gameTransitionStackCounterAtom, stackCounter)
    set(gameHashAtom, hash)
  },
)

function hashToTiles(hash: Uint8Array): number[] {
  const tiles = new Array(64)

  for (let i = 0; i < 32; i++) {
    const byte = hash[i]
    tiles[i] = (byte & 0xf) % 7
    tiles[i + 32] = ((byte >> 4) & 0xf) % 7
  }

  return tiles
}

function hasMatch(tiles: (number | null)[]) {
  for (let i = 0; i < 64; i++) {
    const type = tiles[i]
    const col = i % 8
    const row = Math.floor(i / 8)

    // vertical
    if (row < 6) {
      if (type !== null && type === tiles[i + 8] && type === tiles[i + 16]) {
        return true
      }
    }

    // horizontal
    if (col < 6) {
      if (type !== null && type === tiles[i + 1] && type === tiles[i + 2]) {
        return true
      }
    }
  }
  return false
}

function getMatches(tiles: (number | null)[]) {
  const matches = new Array(64).fill(null)
  const depths = new Array(8).fill(0)

  for (let i = 0; i < 64; i++) {
    const type = tiles[i]
    const col = i % 8
    const row = Math.floor(i / 8)

    // vertical
    if (row < 6) {
      if (type !== null && type === tiles[i + 8] && type === tiles[i + 16]) {
        if (matches[i] === null) depths[col]++
        if (matches[i + 8] === null) depths[col]++
        if (matches[i + 16] === null) depths[col]++

        matches[i] = type
        matches[i + 8] = type
        matches[i + 16] = type
      }
    }

    // horizontal
    if (col < 6) {
      if (type !== null && type === tiles[i + 1] && type === tiles[i + 2]) {
        if (matches[i] === null) depths[col]++
        if (matches[i + 1] === null) depths[col + 1]++
        if (matches[i + 2] === null) depths[col + 2]++

        matches[i] = type
        matches[i + 1] = type
        matches[i + 2] = type
      }
    }
  }

  return {
    matches,
    depths,
  }
}

function subtract(tiles: (number | null)[], mask: (number | null)[]) {
  const result = new Array(64).fill(null)

  for (let i = 0; i < 64; i++) {
    if (mask[i] === null) result[i] = tiles[i]
  }

  return result
}

function applyGravity(tiles: (number | null)[], depths: number[]) {
  // start from bottom
  // every null encounter, increase gravity by 1

  for (let i = 0; i < 8; i++) {
    if (depths[i] === 0) continue
    let gravity = 0
    for (let j = 7; j >= 0; j--) {
      const id = j * 8 + i
      if (tiles[id] === null) {
        gravity++
        continue
      }
      const node = tiles[id]
      const dest = (j + gravity) * 8 + i
      tiles[id] = null
      tiles[dest] = node
    }
  }

  return [...tiles]
}
