import { atom } from 'jotai'
import crypto from 'crypto'

export const gameHashAtom = atom(
  crypto.createHash('sha256').update(Buffer.from('')).digest(),
)

export const gameBoardAtom = atom(new Array(64))

export const gameTurnCountAtom = atom(0)

export const gameFunctions = atom(
  null,
  (get, set, action: { type: string; data?: any }) => {
    switch (action.type) {
      case 'hashToBoard': {
        const hash = get(gameHashAtom)

        set(gameHashAtom, crypto.createHash('sha256').update(hash).digest())
        const board = new Array(64)

        for (let i = 0; i < 32; i++) {
          const byte = hash[i]
          board[i] = (byte & 0xf) % 7
          board[i + 32] = ((byte >> 4) & 0xf) % 7
        }

        set(gameBoardAtom, board)

        break
      }
    }
  },
)

// column depth for gravity

// dropped blocks should not cause deadlocks, shuffle hash until reaching desired output
// - ok to have complete matches, cascade effect

// const seeds = Buffer.concat([
//   Buffer.from(nonce + ''),
//   opponentGamePda.toBytes(),
//   time,
//   gamePda.toBytes(),
// ]);
