import { atom } from 'jotai'
import bs58 from 'bs58'
import { GameTransitions } from '@/enums/GameTransitions'
import { atomFamily, atomWithStorage, createJSONStorage } from 'jotai/utils'
import { Keypair, PublicKey } from '@solana/web3.js'
import { combinePublicKeysAsHash } from '@/utils/combinePublicKeysAsHash'
import {
  absorbMana,
  applyDamage,
  applyGravity,
  checkWinner,
  executableCommands,
  fill,
  getMatches,
  getNextTurn,
  hashToTiles,
  hasMatch,
  Hero,
  heroFromPublicKey,
  subtract,
} from '@/utils/gameFunctions'
import { TargetHero } from '@/enums/TargetHero'
import { SkillTypes } from '@/enums/SkillTypes'
import { GameStateFunctions } from '@/enums/GameStateFunctions'
import { getNextHash } from '@/utils/getNextHash'

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
export const gameTransitionQueueAtom = atom<any[]>([])

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
        hash = getNextHash([hash])
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
    let hash = bs58.decode(gameState.hashes[gameState.hashes.length - 1])

    // NOTE: treatment of player vs opponent depends on context
    // at this point, player is the one who currently doing this turn, opponent otherwise

    let playerHero = gameState.players[gameState.currentTurn]
    let [opponentPubkey, opponentHero] = Object.entries(gameState.players).find(
      (p) => p[0] !== gameState!.currentTurn,
    )!

    // directly mutating this will affect the display, so clone them
    playerHero = { ...playerHero }
    opponentHero = { ...opponentHero }

    switch (action.type) {
      case GameStateFunctions.INIT: {
        const queue = get(gameTransitionQueueAtom)

        queue.push({
          type: GameTransitions.SET,
          turn: gameState.currentTurn,
          tiles: gameState.tiles,
          heroes: gameState.players,
        })

        set(gameTransitionQueueAtom, [...queue])
        break
      }
      case GameStateFunctions.SWAP_NODE: {
        if (isTransitioning) return
        if (action.data.publicKey !== gameState.currentTurn) return
        playerHero.turnTime -= 100

        const queue = get(gameTransitionQueueAtom)
        const tiles = gameState.tiles // queue[queue.length - 1].tiles

        const node1 = action.data.node1.y * 8 + action.data.node1.x
        const node2 = action.data.node2.y * 8 + action.data.node2.x

        if (tiles[node1] === tiles[node2]) return

        let newTiles = [...tiles] as (number | null)[]
        newTiles[node1] = tiles[node2]
        newTiles[node2] = tiles[node1]

        queue.push({
          type: GameTransitions.SWAP,
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

        hash = getNextHash([
          Buffer.from('SWAP'),
          hash,
          Buffer.from(action.data.origin),
          bs58.decode(gameState.currentTurn),
        ])

        while (hasMatch(newTiles)) {
          const { matches, depths, count } = getMatches(newTiles)

          // count: [SWRD, SHLD, SPEC, FIRE, WIND, WATR, EART]
          playerHero = absorbMana(playerHero, count.slice(3)) // TODO: implement mana overflow
          const { flags, queue: commandsQueues } = executableCommands(
            { ...playerHero },
            count.slice(0, 3),
          )

          newTiles = subtract(newTiles, matches)
          queue.push({
            type: GameTransitions.DRAIN,
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

          commandsQueues.forEach((command) => {
            if (command.attack) {
              opponentHero = applyDamage(
                { ...opponentHero }, // TODO: reduce unnecessary object clones
                playerHero.baseDmg + command.attack,
              )
              queue.push({
                type: GameTransitions.ATTACK_NORMAL,
                turn: gameState!.currentTurn,
                damage: opponentPubkey,
                heroes: {
                  [opponentPubkey]: { ...opponentHero },
                },
                duration: 100,
              })
            } else if (command.armor) {
              playerHero.armor += command.armor
              queue.push({
                type: GameTransitions.BUFF_ARMOR,
                turn: gameState!.currentTurn,
                heroes: {
                  [gameState!.currentTurn]: { ...playerHero },
                },
                duration: 100,
              })
            } else if (command.skill) {
              const preCommandHero = { ...playerHero }
              playerHero.fireMp = command.hero.fireMp
              playerHero.windMp = command.hero.windMp
              playerHero.watrMp = command.hero.watrMp
              playerHero.eartMp = command.hero.eartMp

              queue.push({
                type: GameTransitions.CAST,
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

              const postCommand = command.skill.fn({
                commandLevel: command.lvl ?? 1,
                player: playerHero,
                preCommandHero,
                opponent: opponentHero,
                tiles: newTiles,
                gameHash: hash,
              })

              playerHero = postCommand.player
              opponentHero = postCommand.opponent

              // do shuffle check
              if (newTiles !== postCommand.tiles) {
                const updateAll = hash !== postCommand.gameHash

                queue.push({
                  type: GameTransitions.NODE_OUT,
                  tile: [...newTiles],
                  nodes: newTiles.reduce((acc: any, cur, i) => {
                    if (
                      cur !== null &&
                      (updateAll || cur !== postCommand.tiles?.[i])
                    ) {
                      const x = i % 8
                      const y = Math.floor(i / 8)
                      acc[i] = {
                        delay: (x + y) * 50,
                      }
                    }
                    return acc
                  }, {}),
                  duration: 400,
                })

                queue.push({
                  type: GameTransitions.NODE_IN,
                  tile: [...(postCommand.tiles ?? newTiles)],
                  nodes: (postCommand.tiles ?? []).reduce(
                    (acc: any, cur, i) => {
                      if (cur !== null && (updateAll || cur !== newTiles[i])) {
                        const x = i % 8
                        const y = Math.floor(i / 8)
                        acc[i] = {
                          delay: (x + y) * 50,
                        }
                      }
                      return acc
                    },
                    {},
                  ),
                  duration: 400,
                })
              }

              hash = postCommand.gameHash ?? hash
              newTiles = postCommand.tiles ?? newTiles

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

              queue.push({
                type,
                turn: gameState!.currentTurn,
                spotlight,
                // tiles: [...newTiles],
                // nodes (check DRAIN)
                damage:
                  // TODO: included both
                  type === GameTransitions.ATTACK_SPELL
                    ? opponentPubkey
                    : undefined,
                heroes,
                duration: 100,
              })
            }

            // TODO
            checkWinner(playerHero, opponentHero)
          })

          // TODO: issue with shuffle skills

          const { tiles, gravity } = applyGravity(newTiles, depths)
          newTiles = tiles

          hash = getNextHash([Buffer.from('REFILL'), hash])

          const fillers = hashToTiles(hash)

          newTiles = fill(newTiles, fillers, depths)

          queue.push({
            type: GameTransitions.FILL,
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

        queue.push({
          type: GameTransitions.SET,
          heroes: { ...gameState.players },
        })

        set(gameTransitionQueueAtom, [...queue])
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
  },
)
