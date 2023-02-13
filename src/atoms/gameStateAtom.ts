import { atom } from 'jotai'
import crypto from 'crypto'

export const gameHashAtom = atom(
  crypto.createHash('sha256').update(Buffer.from('')).digest(),
)

export const gameTilesAtom = atom(new Array(64))
export const gameTurnCountAtom = atom(0)

export const gameFunctions = atom(
  null,
  (get, set, action: { type: string; data?: any }) => {
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

        set(gameTilesAtom, tiles)
        set(gameHashAtom, hash)

        break
      }
      case 'swapNode': {
        const tiles = get(gameTilesAtom)
        const node1 = action.data.node1.y * 8 + action.data.node1.x
        const node2 = action.data.node2.y * 8 + action.data.node2.x

        if (tiles[node1] === null || tiles[node2] === null) return

        let newTiles = [...tiles]
        newTiles[node1] = tiles[node2]
        newTiles[node2] = tiles[node1]

        if (!hasMatch(newTiles)) {
          // push history
          set(gameTilesAtom, newTiles)
          return
        }

        const { matches, depths } = getMatches(newTiles)

        newTiles = subtract(newTiles, matches)
        // push history

        newTiles = applyGravity(newTiles, depths)

        set(gameTilesAtom, newTiles)
      }
    }
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
      if (type === tiles[i + 8] && type === tiles[i + 16]) {
        return true
      }
    }

    // horizontal
    if (col < 6) {
      if (type === tiles[i + 1] && type === tiles[i + 2]) {
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
      if (type === tiles[i + 8] && type === tiles[i + 16]) {
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
      if (type === tiles[i + 1] && type === tiles[i + 2]) {
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

/*

// RESUME GAME EVEN BOARD IS DEADLOCKED
// ALLOW SWAPPING OF NODES REGARDLESS, CONSUME TURN

Board states that we expect:

1. Stable - has possible matches
2. Unstable - contains matches already
3. Deadlock - no possible matches
4. Hollow - player consumes gems, has holes, pre-dropped state
5. Dropped - no more floating blocks, still incomplete

Phases of the board:

1. Initial board - has to iterate through hashes until we reach ideal Stable board state (with at least 5 possible matches)

History stack
- Array on which displays the sequence of changes of the board
- After running the 'Load' sequence, Stage display will call clear to clean all previous history before 'Load'
- 'Load' state will came from on-chain to update 

Example: 
[
  { 'Load', board: [...] },
  { 'Unstable', board: [...] },
  { 'Hollow', board: [...] },
  { 'Dropped', board: [...], depth: [...] },
  { 'Unstable', board: [...] },
  { 'Hollow', board: [...] },
  { 'Dropped', board: [...], depth: [...] },
  { 'Stable', board: [...] },
  { 'Load', board: [...] }, 
  { 'Unstable', board: [...] },
  { 'Hollow', board: [...] },
  { 'Dropped', board: [...], depth: [...] },
  { 'Deadlock', board: [...] },
  { 'Stable', board: [...] },
]
*/
