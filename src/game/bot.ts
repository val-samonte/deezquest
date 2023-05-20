import { GameState } from '@/atoms/gameStateAtom'
import { Match } from '@/atoms/matchAtom'
import { GameStateFunctions } from '@/enums/GameStateFunctions'
import { Hero } from './gameFunctions'
import { Uses } from '@/utils/innateSkills'

export type Move = {
  origin: number
  dir: 'v' | 'h'
  points: number[]
}

export function toCoord(index: number): [number, number] {
  return [index % 8, Math.floor(index / 8)]
}

export function toIndex(x: number, y: number): number {
  return y * 8 + x
}

export function findPossibleMoves(tiles: number[]): Move[] {
  const moves: Move[] = []

  for (let i = 0; i < 64; i++) {
    const [x, y] = toCoord(i)

    // horizontal swap check
    if (x < 7) {
      let hasMatch = false
      const points = [0, 0, 0, 0, 0, 0, 0]
      const a = { x, y }
      const b = { x: a.x + 1, y: a.y }

      const board = [...tiles]
      const swap = board[i]
      board[i] = board[toIndex(b.x, b.y)]
      board[toIndex(b.x, b.y)] = swap

      const aSym = board[i]
      const bSym = board[toIndex(b.x, b.y)]

      // top
      if (
        a.y > 1 &&
        aSym === board[toIndex(a.x, a.y - 1)] &&
        aSym === board[toIndex(a.x, a.y - 2)]
      ) {
        hasMatch = true
        points[aSym] += 1
      }
      // right
      if (
        a.x < 6 &&
        aSym === board[toIndex(a.x + 1, a.y)] &&
        aSym === board[toIndex(a.x + 2, a.y)]
      ) {
        hasMatch = true
        points[aSym] += 1
      }
      // bottom
      if (
        a.y < 6 &&
        aSym === board[toIndex(a.x, a.y + 1)] &&
        aSym === board[toIndex(a.x, a.y + 2)]
      ) {
        hasMatch = true
        points[aSym] += 1
      }
      // center
      if (
        a.y > 0 &&
        a.y < 7 &&
        aSym === board[toIndex(a.x, a.y - 1)] &&
        aSym === board[toIndex(a.x, a.y + 1)]
      ) {
        hasMatch = true
        points[aSym] += 1
      }

      // top
      if (
        b.y > 1 &&
        bSym === board[toIndex(b.x, b.y - 1)] &&
        bSym === board[toIndex(b.x, b.y - 2)]
      ) {
        hasMatch = true
        points[bSym] += 1
      }
      // left
      if (
        b.x > 1 &&
        bSym === board[toIndex(b.x - 1, b.y)] &&
        bSym === board[toIndex(b.x - 2, b.y)]
      ) {
        hasMatch = true
        points[bSym] += 1
      }
      // bottom
      if (
        b.y < 6 &&
        bSym === board[toIndex(b.x, b.y + 1)] &&
        bSym === board[toIndex(b.x, b.y + 2)]
      ) {
        hasMatch = true
        points[bSym] += 1
      }
      // center
      if (
        b.y > 0 &&
        b.y < 7 &&
        bSym === board[toIndex(b.x, b.y - 1)] &&
        bSym === board[toIndex(b.x, b.y + 1)]
      ) {
        hasMatch = true
        points[bSym] += 1
      }

      if (hasMatch) {
        moves.push({
          dir: 'h',
          origin: i,
          points,
        })
      }
    }

    // vertical swap check
    if (y < 7) {
      let hasMatch = false
      const points = [0, 0, 0, 0, 0, 0, 0]
      const a = { x, y }
      const b = { x: a.x, y: a.y + 1 }

      const board = [...tiles]
      const swap = board[i]
      board[i] = board[toIndex(b.x, b.y)]
      board[toIndex(b.x, b.y)] = swap

      const aSym = board[i]
      const bSym = board[toIndex(b.x, b.y)]

      // left
      if (
        a.x > 1 &&
        aSym === board[toIndex(a.x - 1, a.y)] &&
        aSym === board[toIndex(a.x - 2, a.y)]
      ) {
        hasMatch = true
        points[aSym] += 1
      }
      // top
      if (
        a.y > 1 &&
        aSym === board[toIndex(a.x, a.y - 1)] &&
        aSym === board[toIndex(a.x, a.y - 2)]
      ) {
        hasMatch = true
        points[aSym] += 1
      }
      // right
      if (
        a.x < 6 &&
        aSym === board[toIndex(a.x + 1, a.y)] &&
        aSym === board[toIndex(a.x + 2, a.y)]
      ) {
        hasMatch = true
        points[aSym] += 1
      }
      // center
      if (
        a.x > 0 &&
        a.x < 7 &&
        aSym === board[toIndex(a.x - 1, a.y)] &&
        aSym === board[toIndex(a.x + 1, a.y)]
      ) {
        hasMatch = true
        points[aSym] += 1
      }

      // left
      if (
        b.x > 1 &&
        bSym === board[toIndex(b.x - 1, b.y)] &&
        bSym === board[toIndex(b.x - 2, b.y)]
      ) {
        hasMatch = true
        points[bSym] += 1
      }
      // bottom
      if (
        b.y < 6 &&
        bSym === board[toIndex(b.x, b.y + 1)] &&
        bSym === board[toIndex(b.x, b.y + 2)]
      ) {
        hasMatch = true
        points[bSym] += 1
      }
      // right
      if (
        b.x < 6 &&
        bSym === board[toIndex(b.x + 1, b.y)] &&
        bSym === board[toIndex(b.x + 2, b.y)]
      ) {
        hasMatch = true
        points[bSym] += 1
      }
      // center
      if (
        b.x > 0 &&
        b.x < 7 &&
        bSym === board[toIndex(b.x - 1, b.y)] &&
        bSym === board[toIndex(b.x + 1, b.y)]
      ) {
        hasMatch = true
        points[bSym] += 1
      }

      if (hasMatch) {
        moves.push({
          dir: 'v',
          origin: i,
          points,
        })
      }
    }
  }

  return moves
}

export function getBotMove(
  hero: Hero,
  uses: Uses[],
  match: Match,
  gameState: GameState,
) {
  const moves = findPossibleMoves([...gameState.tiles])

  let payload: any = {
    type: GameStateFunctions.SWAP_NODE,
    data: {
      publicKey: match.opponent.nft,
    },
  }

  if (moves.length === 0) {
    // random
    const dir = Math.random() > 0.5 ? 'h' : 'v'
    let origin = Math.floor(Math.random() * 56)

    // flip
    origin =
      dir === 'v'
        ? origin
        : (() => {
            const [x, y] = toCoord(origin)
            return toIndex(y, x)
          })()

    const [x, y] = toCoord(origin)

    payload.data.origin = dir + origin
    payload.data.node1 = { x, y }
    payload.data.node2 = {
      x: x + (dir === 'h' ? 1 : 0),
      y: y + (dir === 'v' ? 1 : 0),
    }
    payload.data.source = 'random'
  } else {
    // priority
    // - skill consumption: if skill is available, prioritize to match sword / shield / amulet
    // - mana collection: find dominant mana requirements (each skills, sum mana)
    // - execute ordinary commands (sword / shield / amulet)

    let prioritizedSkill = -1
    let count = 0

    uses.forEach((use, i) => {
      if (use.useCount > count) {
        prioritizedSkill = i
        count = use.useCount
      }
    })

    const movIdxPerPts = [-1, -1, -1, -1, -1, -1, -1].map((_, idx) => {
      let highest = -1
      let pt = 0
      moves.forEach((move, i) => {
        if (move.points[idx] > pt) {
          // amulets need 2 pts to be cast
          if (idx === 2 && move.points[idx] < 2) return
          highest = i
          pt = move.points[idx]
        }
      })

      return highest
    })

    let move: Move | undefined
    if (prioritizedSkill > -1 && movIdxPerPts[prioritizedSkill] > -1) {
      move = moves[movIdxPerPts[prioritizedSkill]]
      payload.data.source = 'command'
    } else {
      // try collect mana
      const manaPriority = uses
        .reduce(
          (acc, curr) => {
            curr.ratio.forEach((value, elem) => {
              if (typeof value !== 'undefined') {
                acc[elem] += value[elem]
              }
            })
            return acc
          },
          [0, 0, 0, 0],
        )
        .map((amt, elem) => ({ amt, elem }))
        .sort((a, b) => b.amt - a.amt)

      const manaNotFull = [
        hero.fireMp !== hero.maxMp,
        hero.windMp !== hero.maxMp,
        hero.watrMp !== hero.maxMp,
        hero.eartMp !== hero.maxMp,
      ]

      for (let e = 0; e < 4; e++) {
        const idx = manaPriority[e].elem
        if (movIdxPerPts[3 + idx] !== -1 && manaNotFull[idx]) {
          move = moves[movIdxPerPts[3 + idx]]
          break
        }
      }

      move ??= moves[Math.floor(Math.random() * moves.length)]
      payload.data.source = 'mana'
    }

    const [x, y] = toCoord(move.origin)
    payload.data.origin = move.dir + move.origin
    payload.data.node1 = { x, y }
    payload.data.node2 = {
      x: x + (move.dir === 'h' ? 1 : 0),
      y: y + (move.dir === 'v' ? 1 : 0),
    }
  }

  return payload
}
