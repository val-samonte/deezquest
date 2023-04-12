import { SkillTypes } from '../enums/SkillTypes'
import { describe, expect, test, beforeEach } from '@jest/globals'
import { Keypair } from '@solana/web3.js'
import { combinePublicKeysAsHash } from './combinePublicKeysAsHash'
import {
  hashToTiles,
  Hero,
  heroFromPublicKey,
  getNextTurn,
} from './gameFunctions'
import {
  OperationArguments,
  parseSkillInstructionCode,
} from './parseSkillInstructionCode'

let playerKeypair: Keypair
let opponentKeypair: Keypair
let preMutPlayer: Hero
let preMutOpponent: Hero
let hash: Buffer
let args: OperationArguments

function getOperationsFromCode(codeStr: string) {
  return new Uint8Array(codeStr.split(' ').map((n) => parseInt(n, 16)))
}

beforeEach(() => {
  playerKeypair = new Keypair()
  opponentKeypair = new Keypair()
  preMutPlayer = heroFromPublicKey(playerKeypair.publicKey)
  preMutOpponent = heroFromPublicKey(opponentKeypair.publicKey)
  hash = combinePublicKeysAsHash(
    playerKeypair.publicKey.toBase58(),
    opponentKeypair.publicKey.toBase58(),
    false,
  ) as Buffer

  args = {
    commandLevel: 1,
    depths: [0, 0, 0, 0, 0, 0, 0, 0],
    gameHash: hash,
    opponent: heroFromPublicKey(opponentKeypair.publicKey),
    player: heroFromPublicKey(playerKeypair.publicKey),
    skillType: SkillTypes.ATTACK,
    tiles: hashToTiles(hash),
  }

  getNextTurn(
    args.player,
    args.opponent,
    playerKeypair.publicKey.toBytes(),
    opponentKeypair.publicKey.toBytes(),
    args.gameHash,
  )
})

////////////////////////////////////////////////////////////
// Flow Control
////////////////////////////////////////////////////////////

describe('Flow Control', () => {
  test('Should skip an operation', () => {
    const code = getOperationsFromCode(
      '00 00 00 00 ' + // mana
        '00 ' + //        version
        '01 D0 01 ' + //  D0 = 1
        '01 D1 0A ' + //  D1 = 10
        '02 D0 ' + //     if D0 skip next op (true)
        '36 01 D1 ' + //  player.hp -= D1 (should be skipped)
        '36 01 D1', //    player.hp -= D1 (should be executed)
    )
    parseSkillInstructionCode(args, code)
    expect(args.player.hp).toBe(preMutPlayer.hp - 10)
  })

  test('Should go to specific index', () => {
    const code = getOperationsFromCode(
      '00 00 00 00 ' + // mana
        '00 ' + //        version
        '01 D1 0A ' + //  D1 = 10
        '03 08 ' + //     goto index 8
        '36 01 D1 ' + //  player.hp -= D1 (should be skipped)
        '36 01 D1', //    player.hp -= D1 (should be executed)
    )
    parseSkillInstructionCode(args, code)
    expect(args.player.hp).toBe(preMutPlayer.hp - 10)
  })

  test('Should force exit', () => {
    const code = getOperationsFromCode(
      '00 00 00 00 ' + // mana
        '00 ' + //        version
        '01 D1 0A ' + //  D1 = 10
        '0F ' + //        force exit
        '36 01 D1 ' + //  player.hp -= D1 (should be skipped)
        '36 01 D1', //    player.hp -= D1 (should be skipped)
    )
    parseSkillInstructionCode(args, code)
    expect(args.player.hp).toBe(preMutPlayer.hp)
  })

  test('Should successfully loop operations', () => {
    const code = getOperationsFromCode(
      '00 00 00 00 ' + // mana
        '00 ' + //        version
        '01 D1 0A ' + //  D1 = 10
        '36 01 D1 ' + //  player.hp -= D1
        '02 01 ' + //     if player.hp != 0 skip next op
        '0F ' + //        force exit
        '03 03', //       goto index 3
    )
    parseSkillInstructionCode(args, code)
    expect(args.player.hp).toBe(0)
  })
})

////////////////////////////////////////////////////////////
// Innate Skills
////////////////////////////////////////////////////////////

describe('Burning Punch', () => {
  const code = getOperationsFromCode(
    '03 00 00 00 43 01 00 01 D0 03 37 D0 42 35 D0 07 43 21 25 D0 00',
  )

  test('Command Level 1', () => {
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(preMutOpponent.hp - 3 - preMutPlayer.baseDmg)
  })

  test('Command Level 2', () => {
    args.commandLevel = 2
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(preMutOpponent.hp - 6 - preMutPlayer.baseDmg)
  })

  test('Command Level 3', () => {
    args.commandLevel = 3
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(preMutOpponent.hp - 9 - preMutPlayer.baseDmg)
  })
})

describe('Focus', () => {
  const code = getOperationsFromCode('04 00 00 00 00 35 07 42')

  test('Command Level 1', () => {
    parseSkillInstructionCode(args, code)
    expect(args.player.baseDmg).toBe(preMutPlayer.baseDmg + 1)
  })

  test('Command Level 2', () => {
    args.commandLevel = 2
    parseSkillInstructionCode(args, code)
    expect(args.player.baseDmg).toBe(preMutPlayer.baseDmg + 2)
  })

  test('Command Level 3', () => {
    args.commandLevel = 3
    parseSkillInstructionCode(args, code)
    expect(args.player.baseDmg).toBe(preMutPlayer.baseDmg + 3)
  })
})

describe('Knifehand Strike', () => {
  const code = getOperationsFromCode(
    '00 03 00 00 ' + //      mana
      '43 01 00 ' + //       version
      '01 D0 02 ' + //       D0 = 2
      '01 D1 04 ' + //       D1 = 4
      '01 D2 0A ' + //       D2 = 10
      '37 D0 42 ' + //       D0 *= command level
      '35 D0 D1 ' + //       D0 += D1
      '43 21 25 D0 00 ' + // apply damage D0
      '37 D0 D2 ' + //       D0 *= D2
      '36 26 D0', //         turnTime -= D0
  )

  test('Command Level 1', () => {
    const preMutTurnTime = args.opponent.turnTime
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(preMutOpponent.hp - 6)
    expect(args.opponent.turnTime).toBe(preMutTurnTime - 60)
  })

  test('Command Level 2', () => {
    const preMutTurnTime = args.opponent.turnTime
    args.commandLevel = 2
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(preMutOpponent.hp - 8)
    expect(args.opponent.turnTime).toBe(preMutTurnTime - 80)
  })

  test('Command Level 3', () => {
    const preMutTurnTime = args.opponent.turnTime
    args.commandLevel = 3
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(preMutOpponent.hp - 10)
    expect(args.opponent.turnTime).toBe(preMutTurnTime - 100)
  })
})

describe('Tailwind', () => {
  const code = getOperationsFromCode('00 04 00 00 00 35 0F 42')

  test('Command Level 1', () => {
    parseSkillInstructionCode(args, code)
    expect(args.player.spd).toBe(preMutPlayer.spd + 1)
  })

  test('Command Level 2', () => {
    args.commandLevel = 2
    parseSkillInstructionCode(args, code)
    expect(args.player.spd).toBe(preMutPlayer.spd + 2)
  })

  test('Command Level 3', () => {
    args.commandLevel = 3
    parseSkillInstructionCode(args, code)
    expect(args.player.spd).toBe(preMutPlayer.spd + 3)
  })
})

describe('Whip Kick', () => {
  const code = getOperationsFromCode(
    '00 00 04 00 43 01 00 01 D0 08 37 D0 42 43 21 25 D0 00',
  )

  test('Command Level 1', () => {
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(preMutOpponent.hp - 8)
  })

  test('Command Level 2', () => {
    args.commandLevel = 2
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(preMutOpponent.hp - 16)
  })

  test('Command Level 3', () => {
    args.commandLevel = 3
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(preMutOpponent.hp - 24)
  })
})

describe('First Aid', () => {
  const code = getOperationsFromCode(
    '00 00 03 00 ' + // mana
      '44 01 00 ' + //  versions
      '01 D0 02 ' + //  D0 = 2
      '01 D1 04 ' + //  D1 = 4
      '37 D0 42 ' + //  D0 *= command level
      '35 D0 D1 ' + //  D0 += D1
      '44 01 D0', //    player.hp += D0
  )

  test('Command Level 1', () => {
    args.player.hp = 20
    parseSkillInstructionCode(args, code)
    expect(args.player.hp).toBe(26)
  })

  test('Command Level 2', () => {
    args.commandLevel = 2
    args.player.hp = 20
    parseSkillInstructionCode(args, code)
    expect(args.player.hp).toBe(28)
  })

  test('Command Level 3', () => {
    args.commandLevel = 3
    args.player.hp = 20
    parseSkillInstructionCode(args, code)
    expect(args.player.hp).toBe(30)
  })
})

describe('Crushing Blow', () => {
  const code = getOperationsFromCode(
    '00 00 00 FF ' + //    mana
      '43 01 00 ' + //     version
      '32 D0 42 0D ' + //  D0 = command level * player.earthMp
      '43 21 25 D0 00', // apply damage D0
  )

  test('Command Level 1', () => {
    args.player.eartMp = 6
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(preMutOpponent.hp - args.player.eartMp)
  })

  test('Command Level 2', () => {
    args.commandLevel = 2
    args.player.eartMp = 6
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(preMutOpponent.hp - 2 * args.player.eartMp)
  })

  test('Command Level 3', () => {
    args.commandLevel = 3
    args.player.eartMp = 6
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(preMutOpponent.hp - 3 * args.player.eartMp)
  })
})

describe('Harden', () => {
  const code = getOperationsFromCode(
    '00 00 00 03 00 01 D0 01 01 D1 02 35 D0 42 35 D1 42 35 04 D0 35 05 D1',
  )

  test('Command Level 1', () => {
    parseSkillInstructionCode(args, code)
    expect(args.player.armor).toBe(preMutPlayer.armor + 2)
    expect(args.player.shell).toBe(preMutPlayer.shell + 3)
  })

  test('Command Level 2', () => {
    args.commandLevel = 2
    parseSkillInstructionCode(args, code)
    expect(args.player.armor).toBe(preMutPlayer.armor + 3)
    expect(args.player.shell).toBe(preMutPlayer.shell + 4)
  })

  test('Command Level 3', () => {
    args.commandLevel = 3
    parseSkillInstructionCode(args, code)
    expect(args.player.armor).toBe(preMutPlayer.armor + 4)
    expect(args.player.shell).toBe(preMutPlayer.shell + 5)
  })
})

////////////////////////////////////////////////////////////
// Misc Operators
////////////////////////////////////////////////////////////

describe('Misc Operators', () => {
  test('Shuffle', () => {
    const code = getOperationsFromCode('02 02 02 02 46 01 00 46')
    const preShuffleTiles = JSON.stringify(args.tiles)
    const preShuffleHash = JSON.stringify(args.gameHash)
    parseSkillInstructionCode(args, code)
    expect(JSON.stringify(args.tiles)).not.toBe(preShuffleTiles)
    expect(JSON.stringify(args.gameHash)).not.toBe(preShuffleHash)
  })

  test('Count', () => {
    const code = getOperationsFromCode('02 02 02 02 47 01 00 47 04 49 47 05 FF')

    const count = args.tiles.reduce((acc: number, cur) => {
      // 0x49 count only sword, fire and earth nodes in the tile
      if (cur === 0 || cur === 3 || cur === 6) {
        acc += 1
      }
      return acc
    }, 0)

    parseSkillInstructionCode(args, code)
    expect(args.player.armor).toBe(count)
    expect(args.player.shell).toBe(64)
  })

  test('Replace Nodes', () => {
    const code = getOperationsFromCode('02 02 02 02 48 01 00 48 50 00')

    parseSkillInstructionCode(args, code)

    const found = args.tiles.find((cur) => {
      // 0x50 check for wind / earth nodes (should be absent since they're already replaced)
      if (cur === 4 || cur === 6) {
        return true
      }
      return false
    })

    expect(found).toBeUndefined()
  })
})
