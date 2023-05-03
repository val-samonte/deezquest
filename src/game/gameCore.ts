import { Match } from '@/atoms/matchAtom'
import {
  absorbMana,
  applyDamage,
  applyGravity,
  executableCommands,
  fill,
  getMatches,
  getNextTurn,
  hashToTiles,
  hasMatch,
  Hero,
  heroFromPublicKey,
  subtract,
} from './gameFunctions'
import bs58 from 'bs58'
import { PublicKey } from '@solana/web3.js'
import { GameState } from '@/atoms/gameStateAtom'
import { hashv } from '@/utils/hashv'
import { GameTransitions } from '@/enums/GameTransitions'
import {
  OperationArguments,
  parseSkillInstructionCode,
} from './parseSkillInstructionCode'

export const initialize = (match: Match) => {
  const player = match.player
  const opponent = match.opponent

  if (!player || !opponent) throw Error('Missing player / opponent')

  let playerHero = heroFromPublicKey(player.nft)
  let opponentHero = heroFromPublicKey(opponent.nft)
  let hash = bs58.decode(match.gameHash)

  const heroInTurn = getNextTurn(
    playerHero,
    opponentHero,
    new PublicKey(player.nft).toBytes(),
    new PublicKey(opponent.nft).toBytes(),
    hash,
  )

  const currentTurn = bs58.encode(heroInTurn.pubkey)

  let tiles = new Array(64)
  while (true) {
    tiles = hashToTiles(hash)
    if (!hasMatch(tiles)) {
      break
    }
    hash = hashv([hash])
  }

  const gameState: GameState = {
    hashes: [bs58.encode(hash)],
    currentTurn,
    tiles,
    players: {
      [player.nft]: playerHero,
      [opponent.nft]: opponentHero,
    },
  }

  return gameState
}

interface SwapPayload {
  node1: { x: number; y: number }
  node2: { x: number; y: number }
  origin: string
}

export const swap = (
  payload: SwapPayload,
  currentPublicKey: string,
  currentHero: Hero,
  tiles: (number | null)[],
  gameHash: Uint8Array,
) => {
  const queue: any = [] // used by frontend for transitions

  currentHero.turnTime -= 100

  const node1 = payload.node1.y * 8 + payload.node1.x
  const node2 = payload.node2.y * 8 + payload.node2.x

  // TODO: make an elegant way to not waste move when swapping nodes with same value
  // if (tiles[node1] === tiles[node2]) throw Error('Invalid move')

  let newTiles = [...tiles] as (number | null)[]
  newTiles[node1] = tiles[node2]
  newTiles[node2] = tiles[node1]

  queue.push({
    type: GameTransitions.SWAP,
    turn: currentPublicKey,
    tiles: [...newTiles],
    heroes: {
      [currentPublicKey]: { ...currentHero },
    },
    nodes: {
      [node1]: {
        type: tiles[node2],
        from: {
          x: payload.node2.x,
          y: payload.node2.y,
        },
      },
      [node2]: {
        type: tiles[node1],
        from: {
          x: payload.node1.x,
          y: payload.node1.y,
        },
      },
    },
    duration: 450,
  })

  const newHash = hashv([
    Buffer.from('SWAP'),
    gameHash,
    Buffer.from(payload.origin),
    bs58.decode(currentPublicKey),
  ])

  return {
    queue,
    currentPublicKey,
    currentHero,
    tiles: newTiles,
    gameHash: newHash,
  }
}

export const processGameCombo = (
  currentPublicKey: string,
  opponentPublicKey: string,
  currentHero: Hero,
  opponentHero: Hero,
  tiles: (number | null)[],
  gameHash: Uint8Array,
) => {
  const queue: any = [] // used by frontend for transitions

  while (hasMatch(tiles)) {
    const { matches, depths, count } = getMatches(tiles)

    // count: [SWRD, SHLD, SPEC, FIRE, WIND, WATR, EART]
    currentHero = absorbMana(currentHero, count.slice(3))
    const { flags, queue: commandsQueues } = executableCommands(
      { ...currentHero },
      count.slice(0, 3),
    )

    tiles = subtract(tiles, matches)

    queue.push({
      type: GameTransitions.DRAIN,
      turn: currentPublicKey,
      tiles: [...tiles],
      heroes: {
        [currentPublicKey]: { ...currentHero },
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
          currentHero.baseDmg + command.attack,
        )
        queue.push({
          type: GameTransitions.ATTACK_NORMAL,
          turn: currentPublicKey,
          heroes: {
            [currentPublicKey]: { ...opponentHero },
          },
          duration: 100,
        })
      } else if (command.armor) {
        currentHero.armor += command.armor
        queue.push({
          type: GameTransitions.BUFF_ARMOR,
          turn: currentPublicKey,
          heroes: {
            [currentPublicKey]: { ...currentHero },
          },
          duration: 100,
        })
      } else if (command.skill) {
        queue.push({
          type: GameTransitions.CAST,
          turn: currentPublicKey,
          spotlight: [currentPublicKey],
          heroes: {
            [currentPublicKey]: { ...currentHero },
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

        const args: OperationArguments = {
          commandLevel: command.lvl ?? 1,
          skillType: command.skill.type,
          depths,
          gameHash,
          opponent: opponentHero,
          player: currentHero,
          tiles,
        }

        parseSkillInstructionCode(args, command.skill.code)

        currentHero.fireMp = command.hero.fireMp
        currentHero.windMp = command.hero.windMp
        currentHero.watrMp = command.hero.watrMp
        currentHero.eartMp = command.hero.eartMp

        // do shuffle check
        if (tiles !== args.tiles) {
          const updateAll = gameHash !== args.gameHash

          queue.push({
            type: GameTransitions.NODE_OUT,
            tiles: [...tiles],
            nodes: tiles.reduce((acc: any, cur, i) => {
              if (cur !== null && (updateAll || cur !== args.tiles?.[i])) {
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
            tiles: [...(args.tiles ?? tiles)],
            nodes: (args.tiles ?? []).reduce((acc: any, cur, i) => {
              if (cur !== null && (updateAll || cur !== tiles[i])) {
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
        }

        gameHash = args.gameHash ?? gameHash
        tiles = args.tiles ?? tiles

        const spotlight: any = []
        const heroes: any = {}
        let type = GameTransitions.ATTACK_SPELL

        heroes[currentPublicKey] = { ...currentHero }
        heroes[opponentPublicKey] = { ...opponentHero }

        queue.push({
          type,
          turn: currentPublicKey,
          spotlight,
          // TODO: fade transition
          // tiles: [...newTiles],
          // nodes (check DRAIN)
          heroes,
          duration: 100,
        })
      }
    })

    const { tiles: newTiles, gravity } = applyGravity(tiles, depths)
    tiles = newTiles

    gameHash = hashv([Buffer.from('REFILL'), gameHash])
    const fillers = hashToTiles(gameHash)
    tiles = fill(tiles, fillers, depths)

    queue.push({
      type: GameTransitions.FILL,
      turn: currentPublicKey,
      tiles: [...tiles],
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

  return {
    queue,
    currentPublicKey,
    currentHero,
    opponentPublicKey,
    opponentHero,
    tiles,
    gameHash,
  }
}
