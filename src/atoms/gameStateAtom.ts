import { atom } from 'jotai'
import crypto from 'crypto'
import bs58 from 'bs58'
import { GameTransitions } from '@/enums/GameTransitions'
import { atomFamily, atomWithStorage, createJSONStorage } from 'jotai/utils'
import { Keypair, PublicKey } from '@solana/web3.js'
import { combinePublicKeysAsHash } from '@/utils/combinePublicKeysAsHash'
import {
  absorbMana,
  applyDamage,
  executableCommands,
  getNextTurn,
  Hero,
  heroFromPublicKey,
} from '@/utils/gameFunctions'
import { TargetHero } from '@/enums/TargetHero'
import { SkillTypes } from '@/enums/SkillTypes'
import { GameStateFunctions } from '@/enums/GameStateFunctions'

export interface GameState {
  hashes: string[]
  tiles: number[]
  currentTurn: string
  players: {
    [key: string]: Hero
  }
}

export const gamesStateAtom = atomFamily((matchId: string) =>
  atomWithStorage<GameState | null>(
    `demo_games_${matchId}`,
    null,
    createJSONStorage<GameState | null>(() => sessionStorage),
  ),
)

export const playerKpAtom = atom(() => {
  const playerDemoKp = localStorage.getItem('demo_kp')
  if (!playerDemoKp) return null
  return Keypair.fromSecretKey(bs58.decode(playerDemoKp))
})

export const matchIdAtom = atom((get) => {
  const playerKp = get(playerKpAtom)
  if (!playerKp) return null

  const opponentPubkey = window.localStorage.getItem('demo_opponent')
  if (!opponentPubkey) return null

  return combinePublicKeysAsHash(
    playerKp.publicKey.toBase58(),
    opponentPubkey,
  ) as string
})

export const gameStateAtom = atom(
  (get) => {
    const matchId = get(matchIdAtom)
    if (!matchId) return null

    return get(gamesStateAtom(matchId)) ?? null
  },
  (get, set, data: GameState) => {
    const matchId = get(matchIdAtom)
    if (!matchId) return null

    set(gamesStateAtom(matchId), data)
  },
)

export const isGameTransitioningAtom = atom(false)
export const gameTransitionStackAtom = atom<any[]>([])
export const gameTransitionStackCounterAtom = atom(0)
export const resetGameTransitionStackAtom = atom(null, (_, set) => {
  set(gameTransitionStackCounterAtom, 0)
  set(gameTransitionStackAtom, [])
})

export const gameFunctions = atom(
  null,
  (get, set, action: { type: string; data?: any }) => {
    let gameState = get(gameStateAtom)

    if (!gameState) {
      const playerKp = get(playerKpAtom)
      const opponentPubkey = window.localStorage.getItem('demo_opponent')

      if (!playerKp || !opponentPubkey)
        throw Error('Missing player / opponent public keys')

      const playerPubkey = playerKp.publicKey.toBase58()
      let playerHero = heroFromPublicKey(playerKp.publicKey)
      let opponentHero = heroFromPublicKey(opponentPubkey)
      let hash = combinePublicKeysAsHash(
        playerPubkey,
        opponentPubkey,
        false,
      ) as Uint8Array

      const heroInTurn = getNextTurn(
        playerHero,
        opponentHero,
        playerKp.publicKey.toBytes(),
        new PublicKey(opponentPubkey).toBytes(),
        hash,
      )

      const currentTurn = bs58.encode(heroInTurn.pubkey)

      let tiles = new Array(64)
      while (true) {
        tiles = hashToTiles(hash)
        if (!hasMatch(tiles)) {
          break
        }
        hash = crypto.createHash('sha256').update(hash).digest()
      }

      gameState = {
        hashes: [bs58.encode(hash)],
        currentTurn,
        tiles,
        players: {
          [playerPubkey]: playerHero,
          [opponentPubkey]: opponentHero,
        },
      }

      console.log('GameState Initialized', gameState)
    }

    let isTransitioning = get(isGameTransitioningAtom)
    let stackCounter = get(gameTransitionStackCounterAtom)
    let hash = bs58.decode(gameState.hashes[gameState.hashes.length - 1])

    // NOTE: treatment of player vs opponent depends on context
    // at this point, player is the one who currently doing this turn, opponent otherwise

    let playerHero = gameState.players[gameState.currentTurn]
    let [opponentPubkey, opponentHero] = Object.entries(gameState.players).find(
      (p) => p[0] !== gameState!.currentTurn,
    )!

    switch (action.type) {
      case GameStateFunctions.INIT: {
        const stack = get(gameTransitionStackAtom)

        stack.push({
          type: GameTransitions.SET,
          order: ++stackCounter,
          turn: gameState.currentTurn,
          tiles: gameState.tiles,
          heroes: gameState.players,
        })

        set(gameTransitionStackAtom, [...stack])
        break
      }
      case GameStateFunctions.SWAP_NODE: {
        if (isTransitioning) return
        if (action.data.publicKey !== gameState.currentTurn) return

        playerHero.turnTime -= 100

        const stack = get(gameTransitionStackAtom)
        const tiles = gameState.tiles // stack[stack.length - 1].tiles

        const node1 = action.data.node1.y * 8 + action.data.node1.x
        const node2 = action.data.node2.y * 8 + action.data.node2.x

        if (tiles[node1] === tiles[node2]) return

        let newTiles = [...tiles] as (number | null)[]
        newTiles[node1] = tiles[node2]
        newTiles[node2] = tiles[node1]

        stack.push({
          type: GameTransitions.SWAP,
          order: ++stackCounter,
          turn: gameState.currentTurn,
          tiles: [...newTiles],
          heroes: {
            [gameState.currentTurn]: { ...playerHero },
          },
          nodes: {
            [node1]: {
              type: tiles[node2],
              from: {
                x: action.data.node2.x,
                y: action.data.node2.y,
              },
            },
            [node2]: {
              type: tiles[node1],
              from: {
                x: action.data.node1.x,
                y: action.data.node1.y,
              },
            },
          },
          duration: 450,
        })

        hash = crypto
          .createHash('sha256')
          .update(
            Buffer.concat([
              Buffer.from('SWAP'),
              hash,
              Buffer.from(action.data.origin),
              bs58.decode(gameState.currentTurn),
            ]),
          )
          .digest()

        while (hasMatch(newTiles)) {
          const { matches, depths, count } = getMatches(newTiles)

          // count: [SWRD, SHLD, SPEC, FIRE, WIND, WATR, EART]
          playerHero = absorbMana(playerHero, count.slice(3))
          const { flags, stacks: commandsStacks } = executableCommands(
            playerHero,
            count.slice(0, 3),
          )

          newTiles = subtract(newTiles, matches)
          stack.push({
            type: GameTransitions.DRAIN,
            order: ++stackCounter,
            turn: gameState.currentTurn,
            tiles: [...newTiles],
            heroes: {
              [gameState.currentTurn]: { ...playerHero },
            },
            nodes: matches.reduce((acc, cur, i) => {
              if (cur !== null) {
                let variation

                if (matches[i] === 0 && !flags[0] && count[0] > 2) {
                  variation = GameTransitions.DRAIN_STAB
                } else if (matches[i] === 2 && (count[2] < 4 || !flags[2])) {
                  variation = GameTransitions.DRAIN_FADE
                } else if (flags[matches[i]]) {
                  variation = GameTransitions.DRAIN_GLOW
                }

                acc[i] = {
                  variation,
                  type: matches[i],
                  from: {
                    x: i % 8,
                    y: Math.floor(i / 8),
                  },
                }
              }
              return acc
            }, {}),
            duration: 600,
          })

          commandsStacks.forEach((command) => {
            if (command.attack) {
              opponentHero = applyDamage(opponentHero, command.attack)
              stack.push({
                type: GameTransitions.ATTACK_NORMAL,
                order: ++stackCounter,
                turn: gameState!.currentTurn,
                damage: opponentPubkey,
                heroes: {
                  [opponentPubkey]: { ...opponentHero },
                },
                duration: 100,
              })
            } else if (command.armor) {
              playerHero.armor += command.armor
              stack.push({
                type: GameTransitions.BUFF_ARMOR,
                order: ++stackCounter,
                turn: gameState!.currentTurn,
                heroes: {
                  [gameState!.currentTurn]: { ...playerHero },
                },
                duration: 100,
              })
            } else if (command.skill) {
              playerHero.fireMp = command.hero.fireMp
              playerHero.windMp = command.hero.windMp
              playerHero.watrMp = command.hero.watrMp
              playerHero.eartMp = command.hero.eartMp

              stack.push({
                type: GameTransitions.CAST,
                order: ++stackCounter,
                turn: gameState!.currentTurn,
                spotlight: [gameState!.currentTurn],
                heroes: {
                  [gameState!.currentTurn]: { ...playerHero },
                },
                skill: {
                  lvl: command.lvl ?? 1,
                  name: command.skill.name,
                  type: command.skill.type,
                },
                nodes: matches.reduce((acc, cur, i) => {
                  if (cur !== null) {
                    acc[i] = {
                      type: matches[i],
                    }
                  }
                  return acc
                }, {}),
                duration: 1500,
              })

              const postCommand = command.skill.fn(
                command.lvl ?? 1,
                playerHero,
                opponentHero,
                newTiles,
                hash,
              )

              playerHero = postCommand.player
              opponentHero = postCommand.opponent
              newTiles = postCommand.tiles
              hash = postCommand.gameHash

              const spotlight: any = []
              const heroes: any = {}
              let type = GameTransitions.ATTACK_SPELL

              if (
                command.skill.target === TargetHero.SELF ||
                command.skill.target === TargetHero.BOTH
              ) {
                spotlight.push(gameState!.currentTurn)
                heroes[gameState!.currentTurn] = { ...playerHero }

                if (command.skill.type === SkillTypes.SUPPORT) {
                  type = GameTransitions.BUFF_SPELL
                }
              }
              if (
                command.skill.target === TargetHero.ENEMY ||
                command.skill.target === TargetHero.BOTH
              ) {
                spotlight.push(opponentPubkey)
                heroes[opponentPubkey] = { ...opponentHero }
              }

              stack.push({
                type,
                order: ++stackCounter,
                turn: gameState!.currentTurn,
                spotlight,
                damage:
                  // TODO: included both
                  type === GameTransitions.ATTACK_SPELL
                    ? opponentPubkey
                    : undefined,
                heroes,
                // tiles: [...newTiles]
                duration: 100,
              })
            }

            // TODO: HP check after each command
          })

          // TODO: issue with shuffle skills

          const { tiles, gravity } = applyGravity(newTiles, depths)
          newTiles = tiles

          hash = crypto
            .createHash('sha256')
            .update(Buffer.concat([Buffer.from('REFILL'), hash]))
            .digest()
          const fillers = hashToTiles(hash)

          newTiles = fill(newTiles, fillers, depths)

          stack.push({
            type: GameTransitions.FILL,
            order: ++stackCounter,
            turn: gameState.currentTurn,
            tiles: [...newTiles],
            nodes: matches.reduce((acc, _, i) => {
              if (gravity[i] !== null) {
                acc[i] = {
                  from: {
                    x: i % 8,
                    y: Math.floor(i / 8) - gravity[i],
                  },
                }
              }
              return acc
            }, {}),
            duration: 850,
          })
        }

        gameState.tiles = [...newTiles] as number[]
        gameState.hashes = [...gameState.hashes, bs58.encode(hash)]
        gameState.players = {
          [gameState.currentTurn]: playerHero,
          [opponentPubkey]: opponentHero,
        }

        stack.push({
          type: GameTransitions.SET,
          order: ++stackCounter,
          turn: gameState.currentTurn,
          tiles: gameState.tiles,
          heroes: gameState.players,
        })

        // console.log(stack, gameState)

        set(gameTransitionStackAtom, [...stack])
        break
      }
    }

    const nextTurn = getNextTurn(
      playerHero,
      opponentHero,
      new PublicKey(gameState.currentTurn).toBytes(),
      new PublicKey(opponentPubkey).toBytes(),
      hash,
    )

    set(gameStateAtom, {
      ...gameState,
      currentTurn: bs58.encode(nextTurn.pubkey),
    })

    set(gameTransitionStackCounterAtom, stackCounter)
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
  const count = new Array(7).fill(0)
  const depths = new Array(8).fill(0)

  for (let i = 0; i < 64; i++) {
    const type = tiles[i]
    const col = i % 8
    const row = Math.floor(i / 8)

    // vertical
    if (row < 6) {
      if (type !== null && type === tiles[i + 8] && type === tiles[i + 16]) {
        if (matches[i] === null) {
          depths[col]++
          count[type]++
          matches[i] = type
        }
        if (matches[i + 8] === null) {
          depths[col]++
          count[type]++
          matches[i + 8] = type
        }
        if (matches[i + 16] === null) {
          depths[col]++
          count[type]++
          matches[i + 16] = type
        }
      }
    }

    // horizontal
    if (col < 6) {
      if (type !== null && type === tiles[i + 1] && type === tiles[i + 2]) {
        if (matches[i] === null) {
          depths[col]++
          count[type]++
          matches[i] = type
        }
        if (matches[i + 1] === null) {
          depths[col + 1]++
          count[type]++
          matches[i + 1] = type
        }
        if (matches[i + 2] === null) {
          depths[col + 2]++
          count[type]++
          matches[i + 2] = type
        }
      }
    }
  }

  return {
    matches,
    depths,
    count,
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
  const gravityMap = new Array(64).fill(null)

  for (let i = 0; i < 8; i++) {
    if (depths[i] === 0) continue
    let gravity = 0
    let blanks = []
    for (let j = 7; j >= 0; j--) {
      const id = j * 8 + i
      if (tiles[id] === null) {
        gravity++
        blanks.push(id)
        continue
      }

      for (let k = 0; k < blanks.length; k++) {
        gravityMap[blanks[k]] = gravity + (gravityMap[blanks[k]] ?? 0)
      }
      blanks = []

      const node = tiles[id]
      const dest = (j + gravity) * 8 + i
      tiles[id] = null
      tiles[dest] = node
      gravityMap[id] = gravity
    }

    for (let k = 0; k < blanks.length; k++) {
      gravityMap[blanks[k]] = gravity + (gravityMap[blanks[k]] ?? 0)
    }
  }

  return {
    gravity: gravityMap,
    tiles: [...tiles],
  }
}

function fill(
  tiles: (number | null)[],
  fillers: (number | null)[],
  depths: number[],
) {
  for (let i = 0; i < 8; i++) {
    if (depths[i] === 0) continue
    for (let j = 0; j < depths[i]; j++) {
      const id = j * 8 + i
      tiles[id] = fillers[id]
    }
  }

  return [...tiles]
}
