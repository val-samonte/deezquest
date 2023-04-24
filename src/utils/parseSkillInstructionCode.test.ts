import { SkillTypes } from '../enums/SkillTypes'
import { describe, expect, test, beforeEach } from '@jest/globals'
import { Keypair } from '@solana/web3.js'
import { combinePublicKeysAsHash } from './combinePublicKeysAsHash'
import { Hero, heroFromPublicKey, getNextTurn } from './gameFunctions'
import {
  OperationArguments,
  parseSkillInstructionCode,
} from './parseSkillInstructionCode'
import { hashv } from './hashv'
import { getOperationsFromCode, innateSkills } from './innateSkills'

let playerKeypair: Keypair
let opponentKeypair: Keypair
let preMutPlayer: Hero
let preMutOpponent: Hero
let hash: Buffer
let args: OperationArguments

const applyDamage = (hero: Hero, physical = 0, magical = 0) => {
  if (hero.armor < physical) {
    physical -= hero.armor
    hero.armor = 0
  } else {
    hero.armor -= physical
    physical = 0
  }

  if (hero.shell < magical) {
    magical -= hero.shell
    hero.shell = 0
  } else {
    hero.shell -= magical
    magical = 0
  }

  hero.hp -= physical + magical

  return hero
}

const hashToTiles = (hash: Uint8Array): number[] => {
  const tiles = new Array(64)

  for (let i = 0; i < 32; i++) {
    const byte = hash[i]
    tiles[i] = (byte & 0xf) % 7
    tiles[i + 32] = ((byte >> 4) & 0xf) % 7
  }

  return tiles
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

  preMutPlayer.turnTime = args.player.turnTime
  preMutOpponent.turnTime = args.opponent.turnTime
  args.player.fireMp = preMutPlayer.fireMp = Math.floor(Math.random() * 10)
  args.player.windMp = preMutPlayer.windMp = Math.floor(Math.random() * 10)
  args.player.watrMp = preMutPlayer.watrMp = Math.floor(Math.random() * 10)
  args.player.eartMp = preMutPlayer.eartMp = Math.floor(Math.random() * 10)
  args.opponent.armor = preMutOpponent.armor = Math.floor(Math.random() * 10)
  args.opponent.shell = preMutOpponent.shell = Math.floor(Math.random() * 10)
  args.opponent.fireMp = preMutOpponent.fireMp = Math.floor(Math.random() * 10)
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

  describe('Should switch to correct operation', () => {
    const code = getOperationsFromCode(
      '00 00 00 00 ' + //   mana
        '00 ' + //          version
        '01 D0 03 ' + //    D0 = 3
        '31 D1 D0 42 ' + // D1 = 3 - command level
        '02 D1 ' + //       switch to (usually the next ops are goto ops)
        // Command Level 3 (D1 is 0)
        '35 04 D0 ' + //    player.armor = 9
        // Command Level 2 (D1 is 1)
        '35 04 D0 ' + //    player.armor = 6
        // Command Level 1 (D1 is 2)
        '35 04 D0', //      player.armor = 3
    )

    test('Command Level 1', () => {
      parseSkillInstructionCode(args, code)
      expect(args.player.armor).toBe(preMutPlayer.armor + 3)
    })

    test('Command Level 2', () => {
      args.commandLevel = 2
      parseSkillInstructionCode(args, code)
      expect(args.player.armor).toBe(preMutPlayer.armor + 6)
    })

    test('Command Level 3', () => {
      args.commandLevel = 3
      parseSkillInstructionCode(args, code)
      expect(args.player.armor).toBe(preMutPlayer.armor + 9)
    })
  })

  test('Should successfully loop operations', () => {
    const code = getOperationsFromCode(
      '00 00 00 00 ' + //   mana
        '00 ' + //          version
        '01 D0 00 ' + //    D0 = 0
        '01 D1 0A ' + //    D1 = 10
        '36 01 D1 ' + //    player.hp -= D1
        '12 D2 D0 01 ' + // D2 = 0 < player.hp (will give 0 or 1)
        '02 D2 ' + //       if D2 skip next op
        '0F ' + //          force exit
        '03 03', //         goto index 3
    )
    parseSkillInstructionCode(args, code)
    expect(args.player.hp).toBe(0)
  })
})

////////////////////////////////////////////////////////////
// Misc Operators
////////////////////////////////////////////////////////////

describe('Misc Operators', () => {
  test('Shuffle', () => {
    const code = innateSkills[8].code
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
      // 0x50 check for wind / earth nodes (should be absent since they're already been replaced)
      if (cur === 4 || cur === 6) {
        return true
      }
      return false
    })

    expect(found).toBeUndefined()
  })
})

////////////////////////////////////////////////////////////
// Innate Skills
////////////////////////////////////////////////////////////

describe('Burning Punch', () => {
  const code = innateSkills[0].code

  test('Command Level 1', () => {
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(
      applyDamage(preMutOpponent, 0, 4 + preMutPlayer.baseDmg).hp,
    )
  })

  test('Command Level 2', () => {
    args.commandLevel = 2
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(
      applyDamage(preMutOpponent, 0, 8 + preMutPlayer.baseDmg).hp,
    )
  })

  test('Command Level 3', () => {
    args.commandLevel = 3
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(
      applyDamage(preMutOpponent, 0, 12 + preMutPlayer.baseDmg).hp,
    )
  })
})

describe('Focus', () => {
  const code = innateSkills[4].code

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
  const code = innateSkills[1].code

  test('Command Level 1', () => {
    const preMutTurnTime = args.opponent.turnTime
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(applyDamage(preMutOpponent, 0, 6).hp)
    expect(args.opponent.turnTime).toBe(preMutTurnTime - 60)
  })

  test('Command Level 2', () => {
    const preMutTurnTime = args.opponent.turnTime
    args.commandLevel = 2
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(applyDamage(preMutOpponent, 0, 8).hp)
    expect(args.opponent.turnTime).toBe(preMutTurnTime - 80)
  })

  test('Command Level 3', () => {
    const preMutTurnTime = args.opponent.turnTime
    args.commandLevel = 3
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(applyDamage(preMutOpponent, 0, 10).hp)
    expect(args.opponent.turnTime).toBe(preMutTurnTime - 100)
  })
})

describe('Tailwind', () => {
  const code = innateSkills[5].code

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
  const code = innateSkills[2].code

  test('Command Level 1', () => {
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(applyDamage(preMutOpponent, 0, 10).hp)
  })

  test('Command Level 2', () => {
    args.commandLevel = 2
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(applyDamage(preMutOpponent, 0, 20).hp)
  })

  test('Command Level 3', () => {
    args.commandLevel = 3
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(applyDamage(preMutOpponent, 0, 30).hp)
  })
})

describe('First Aid', () => {
  const code = innateSkills[6].code

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
  const code = innateSkills[3].code

  test('Command Level 1', () => {
    args.player.eartMp = 6
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(
      applyDamage(preMutOpponent, 0, args.player.eartMp).hp,
    )
  })

  test('Command Level 2', () => {
    args.commandLevel = 2
    args.player.eartMp = 6
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(
      applyDamage(preMutOpponent, 0, args.player.eartMp * 2).hp,
    )
  })

  test('Command Level 3', () => {
    args.commandLevel = 3
    args.player.eartMp = 6
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(
      applyDamage(preMutOpponent, 0, args.player.eartMp * 3).hp,
    )
  })
})

describe('Harden', () => {
  const code = innateSkills[7].code

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
// Sample Skills (Old skills during Grizzlython)
////////////////////////////////////////////////////////////

describe('Burning Punch (Old)', () => {
  // Deals x2 of ATTACK DMG plus additional MAGIC DMG based on the gap of FIRE MANA between the heroes.
  // LVL 3 deals x2 of the mana gap instead.

  const code = getOperationsFromCode(
    '05 00 00 00 ' + //      mana
      '40 01 43 01 00 ' + // version
      '01 CF 03 ' + //       CF = 3
      '01 D0 02 ' + //       D0 = 2
      '30 D1 07 42 ' + //    D1 = player.baseDmg + commandLevel
      '37 D1 D0 ' + //       D1 *= D0
      '40 D2 0A 2A ' + //    D2 = gap(player.fireMp, opponent.fireMp)
      '10 D3 42 CF ' + //    D3 = commandLevel != CF
      '02 D3 ' + //          skip D3
      '37 D2 D0 ' + //       D2 *= D0
      '43 21 24 D1 ' + //    apply damage to player (physical) D1
      '43 21 25 D2', //      apply damage to player (magical) D2
  )

  const command = (lvl: number, player: Hero, opponent: Hero) => {
    const atk = (player.baseDmg + lvl) * 2
    const mag = Math.abs((player.fireMp ?? 0) - opponent.fireMp)

    applyDamage(opponent, atk, mag * (lvl === 3 ? 2 : 1))
  }

  test('Command Level 1', () => {
    command(args.commandLevel, preMutPlayer, preMutOpponent)
    parseSkillInstructionCode(args, code)

    expect(args.opponent.hp).toBe(preMutOpponent.hp)
    expect(args.opponent.armor).toBe(preMutOpponent.armor)
    expect(args.opponent.shell).toBe(preMutOpponent.shell)
  })

  test('Command Level 2', () => {
    args.commandLevel = 2
    command(args.commandLevel, preMutPlayer, preMutOpponent)
    parseSkillInstructionCode(args, code)

    expect(args.opponent.hp).toBe(preMutOpponent.hp)
    expect(args.opponent.armor).toBe(preMutOpponent.armor)
    expect(args.opponent.shell).toBe(preMutOpponent.shell)
  })

  test('Command Level 3', () => {
    args.commandLevel = 3
    command(args.commandLevel, preMutPlayer, preMutOpponent)
    parseSkillInstructionCode(args, code)

    expect(args.opponent.hp).toBe(preMutOpponent.hp)
    expect(args.opponent.armor).toBe(preMutOpponent.armor)
    expect(args.opponent.shell).toBe(preMutOpponent.shell)
  })
})

describe('Knifehand Strike (Old)', () => {
  // Deals 6|8|10 MAGIC DMG and 60|80|100 Turn Time reduction.
  // Gains additional MAGIC DMG on LVL 3 based on the difference of SPD between the heroes.

  const code = getOperationsFromCode(
    '00 03 00 00 ' + //      mana
      '40 01 43 01 00 ' + // version
      '01 CF 03 ' + //       CF = 3
      '01 D0 02 ' + //       D0 = 2
      '01 D1 04 ' + //       D1 = 4
      '01 D2 0A ' + //       D2 = 10
      '37 D0 42 ' + //       D0 *= command level
      '35 D0 D1 ' + //       D0 += D1
      '43 21 25 D0 ' + //    apply damage D0
      '37 D0 D2 ' + //       D0 *= D2
      '36 26 D0 ' + //       turnTime -= D0
      '11 CF CF 42 ' + //    CF = CF == command level
      '02 CF ' + //          skip if command level == 3
      '0F ' + //             end (command level < 3)
      '40 D0 0F 2F ' + //    D0 = gap between player and opponent's SPD
      '12 CF 2F 0F ' + //    CF = opponent.spd < player.spd
      '02 CF ' + //          skip if opponent.spd < player.spd
      '0F ' + //             end (opponent.spd >= player.spd)
      '43 21 25 D0', //      apply damage D0
  )

  const command = (lvl: number, player: Hero, opponent: Hero) => {
    let mag = [6, 8, 10][lvl - 1]
    if (lvl === 3) {
      mag += player.spd > opponent.spd ? player.spd - opponent.spd : 0
    }
    opponent = applyDamage(opponent, 0, mag)
    const turnTimeReduction = lvl * 20 + 40
    opponent.turnTime =
      opponent.turnTime < turnTimeReduction
        ? 0
        : opponent.turnTime - turnTimeReduction
  }

  test('Command Level 1', () => {
    command(args.commandLevel, preMutPlayer, preMutOpponent)
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(preMutOpponent.hp)
    expect(args.opponent.shell).toBe(preMutOpponent.shell)
    expect(args.opponent.turnTime).toBe(preMutOpponent.turnTime)
  })

  test('Command Level 2', () => {
    args.commandLevel = 2
    command(args.commandLevel, preMutPlayer, preMutOpponent)
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(preMutOpponent.hp)
    expect(args.opponent.shell).toBe(preMutOpponent.shell)
    expect(args.opponent.turnTime).toBe(preMutOpponent.turnTime)
  })

  test('Command Level 3', () => {
    args.commandLevel = 3
    command(args.commandLevel, preMutPlayer, preMutOpponent)
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(preMutOpponent.hp)
    expect(args.opponent.shell).toBe(preMutOpponent.shell)
    expect(args.opponent.turnTime).toBe(preMutOpponent.turnTime)
  })
})

describe('Aquashot', () => {
  // Deals 4|12|16 MAGIC DMG.
  // Gains additional MAGIC DMG on LVL 3 based on the difference of VIT between the heroes.
  // LVL 3 pierces through SHELL.

  const code = getOperationsFromCode(
    '00 00 04 00 ' + //      mana
      '40 01 43 01 00 ' + // version
      '02 42 ' + //          switch command level
      '0F ' + //             end (noop)
      '03 09 ' + //          jump to command level 1
      '03 0E ' + //          jump to command level 2
      '03 16 ' + //          jump to command level 3
      // Command Level 1
      '01 D0 04 ' + //       D0 = 4
      '03 11 ' + //          jump to apply damage
      // Command Level 2
      '01 D0 0C ' + //       D0 = 12
      '43 21 25 D0 ' + //    apply damage D0
      '0F ' + //             end
      // Command Level 3
      '01 D0 10 ' + //       D0 = 16
      '40 D1 10 30 ' + //    D1 = gap between player and opponent's VIT
      '12 CF 10 30 ' + //    CF = player.vit < opponent.vit
      '02 CF ' + //          skip if player.vit < opponent.vit
      '35 D0 D1 ' + //       add diff to damage (D0)
      '36 21 D0', //         direct damage HP (piercing)
  )

  const command = (lvl: number, player: Hero, opponent: Hero) => {
    let mag = [4, 12, 16][lvl - 1]
    if (lvl === 3) {
      mag += player.vit > opponent.vit ? player.vit - opponent.vit : 0
      opponent.hp -= mag
    } else {
      opponent = applyDamage(opponent, 0, mag)
    }
  }

  test('Command Level 1', () => {
    command(args.commandLevel, preMutPlayer, preMutOpponent)
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(preMutOpponent.hp)
    expect(args.opponent.shell).toBe(preMutOpponent.shell)
  })

  test('Command Level 2', () => {
    args.commandLevel = 2
    command(args.commandLevel, preMutPlayer, preMutOpponent)
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(preMutOpponent.hp)
    expect(args.opponent.shell).toBe(preMutOpponent.shell)
  })

  test('Command Level 3', () => {
    args.commandLevel = 3
    command(args.commandLevel, preMutPlayer, preMutOpponent)
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(preMutOpponent.hp)
    expect(args.opponent.shell).toBe(preMutOpponent.shell)
  })
})

describe('Crushing Blow (Old)', () => {
  // Deals 2 MAGIC DMG per EARTH MANA of the hero.
  // LVL 2|3 deals current value of STR as additional ATTACK DMG if EARTH MANA converted is greater than 5.
  // LVL 3 destroys ARMOR after damage is applied.

  const code = getOperationsFromCode(
    '00 00 00 FF ' + //      mana
      '40 01 43 01 00 ' + // version
      '01 CE 05 ' + //       CE = 5
      '01 CF 02 ' + //       CF = 2
      '32 D0 0D CF ' + //    D0 = player.eartMp * CF
      '43 21 25 D0 ' + //    apply magic damage D0
      '02 42 ' + //          switch command level
      '0F ' + //             end (noop)
      '0F ' + //             end (command level 1)
      '03 17 ' + //          jump to command level 2
      // Command Level 3
      '01 D1 01 ' + //       enable destroy armor flag
      // Command Level 2 & 3
      '13 D2 0D CE ' + //    D2 = player.eartMp <= CE
      '02 D2 ' + //          skip next op if player.eartMp <= 5
      '43 21 24 11 ' + //    apply physical damage with player.str
      '02 D1 ' + //          skip end if armor flag
      '0F ' + //             end
      '01 24 00', //         opponent.armor = 0 (destroy opponent armor)
  )

  const command = (lvl: number, player: Hero, opponent: Hero) => {
    let mag = (player?.eartMp ?? 1) * 2
    let atk = 0
    if (lvl > 1 && (player?.eartMp ?? 0) >= 5) {
      atk = player.str
    }
    opponent = applyDamage(opponent, atk, mag)
    if (lvl === 3) {
      opponent.armor = 0
    }
  }

  test('Command Level 1', () => {
    command(args.commandLevel, preMutPlayer, preMutOpponent)
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(preMutOpponent.hp)
    expect(args.opponent.armor).toBe(preMutOpponent.armor)
    expect(args.opponent.shell).toBe(preMutOpponent.shell)
  })

  test('Command Level 2', () => {
    args.commandLevel = 2
    command(args.commandLevel, preMutPlayer, preMutOpponent)
    parseSkillInstructionCode(args, code)
    expect(args.opponent.hp).toBe(preMutOpponent.hp)
    expect(args.opponent.armor).toBe(preMutOpponent.armor)
    expect(args.opponent.shell).toBe(preMutOpponent.shell)
  })

  test('Command Level 3', () => {
    args.commandLevel = 3
    command(args.commandLevel, preMutPlayer, preMutOpponent)
    parseSkillInstructionCode(args, code)
    expect(args.player.str).toBe(preMutPlayer.str)
    expect(args.opponent.hp).toBe(preMutOpponent.hp)
    expect(args.opponent.armor).toBe(preMutOpponent.armor)
    expect(args.opponent.shell).toBe(preMutOpponent.shell)
  })
})

describe('Healing', () => {
  // Recover 6|8|10 HP.
  // LVL 3 adds x2 value of VIT as HP.

  const code = getOperationsFromCode(
    '00 00 04 00 ' + //   mana
      '44 01 00 ' + //    version
      '01 CE 03 ' + //    CE = 3
      '01 CF 02 ' + //    CF = 2
      '01 D0 06 ' + //    D0 = 6
      '36 CE 42 ' + //    CE -= command level
      '02 CE ' + //       switch command level
      '03 14 ' + //       jump to command level 3
      '03 1E ' + //       jump to command level 2
      '03 21 ' + //       jump to command level 1
      // Command Level 3
      '32 D1 10 CF ' + // D1 = player.vit * CF
      '35 D0 D1 ' + //    D0 += D1
      '35 D0 CF ' + //    D0 += CF
      // Command Level 2
      '35 D0 CF ' + //    D0 += CF
      // Command Level 1
      '44 01 D0', //      heal(player.hp, D0)
  )

  const command = (lvl: number, player: Hero, _: Hero) => {
    let heal = [6, 8, 10][lvl - 1]
    if (lvl === 3) {
      heal += player.vit * 2
    }
    player.hp = Math.min(player.hp + heal, player.maxHp)
  }

  test('Command Level 1', () => {
    args.player.hp = preMutPlayer.hp = 80
    command(args.commandLevel, preMutPlayer, preMutOpponent)
    parseSkillInstructionCode(args, code)
    expect(args.player.hp).toBe(preMutPlayer.hp)
  })

  test('Command Level 2', () => {
    args.commandLevel = 2
    args.player.hp = preMutPlayer.hp = 80
    command(args.commandLevel, preMutPlayer, preMutOpponent)
    parseSkillInstructionCode(args, code)
    expect(args.player.hp).toBe(preMutPlayer.hp)
  })

  test('Command Level 3', () => {
    args.commandLevel = 3
    args.player.hp = preMutPlayer.hp = 80
    command(args.commandLevel, preMutPlayer, preMutOpponent)
    parseSkillInstructionCode(args, code)
    expect(args.player.hp).toBe(preMutPlayer.hp)
  })
})

describe('Manawall', () => {
  // Converts all EARTH MANA into SHELL.
  // Gain ARMOR based on STR at LVL 2|3 if EARTH MANA converted is greater than 5.

  const code = getOperationsFromCode(
    '00 00 00 FF ' + //      mana
      '40 01 43 01 00 ' + // version
      '01 CE 05 ' + //       CE = 5
      '01 CF 01 ' + //       CF = 1
      '35 05 0D ' + //       player.shell += player.eartMp
      '11 CF CF 42 ' + //    CF = CF == command level
      '02 CF ' + //          skip if command level == 1
      '03 12 ' + //          jump to command level 2 / 3
      '0F ' + //             end
      // Command Level 2 / 3
      '13 D2 0D CE ' + //    D2 = player.eartMp <= CE
      '02 D2 ' + //          skip next op if player.eartMp <= 5
      '35 04 11', //         add armor based on str
  )

  const command = (lvl: number, player: Hero, _: Hero) => {
    player.shell += player?.eartMp ?? 1
    if (lvl > 1 && (player?.eartMp ?? 0) >= 5) {
      player.armor += player.str
    }
  }

  test('Command Level 1', () => {
    command(args.commandLevel, preMutPlayer, preMutOpponent)
    parseSkillInstructionCode(args, code)
    expect(args.player.shell).toBe(preMutPlayer.shell)
  })

  test('Command Level 2', () => {
    args.commandLevel = 2
    command(args.commandLevel, preMutPlayer, preMutOpponent)
    parseSkillInstructionCode(args, code)
    expect(args.player.str).toBe(preMutPlayer.str)
    expect(args.player.armor).toBe(preMutPlayer.armor)
    expect(args.player.shell).toBe(preMutPlayer.shell)
  })

  test('Command Level 3', () => {
    args.commandLevel = 3
    command(args.commandLevel, preMutPlayer, preMutOpponent)
    parseSkillInstructionCode(args, code)
    expect(args.player.str).toBe(preMutPlayer.str)
    expect(args.player.armor).toBe(preMutPlayer.armor)
    expect(args.player.shell).toBe(preMutPlayer.shell)
  })
})

describe('Grizzlython Old Special Skills', () => {
  test('Combustion', () => {
    // Converts all WATER MANA in the board into FIRE MANA, deals x2 MAGIC DMG per each converted WATER MANA.

    const code = getOperationsFromCode(
      '08 00 00 00 ' + //            mana
        '43 01 47 01 48 01 00 ' + // versions (damage, count, replace)
        '01 CF 02 ' + //             CF = 2
        '47 D0 20 ' + //             D0 = count water nodes
        '48 20 03 ' + //             replace water nodes (0x20) with fire nodes (0x3, exact symbol 0-7)
        '37 D0 CF ' + //             D0 *= CF
        '43 21 25 D0', //            apply damage D0
    )

    const command = (tiles: (number | null)[], opponent: Hero) => {
      let count = 0
      let newTiles = [...tiles]
      for (let i = 0; i < tiles.length; i++) {
        // [SWRD, SHLD, SPEC, FIRE, WIND, WATR, EART]
        if (tiles[i] === 5) {
          count++
          newTiles[i] = 3
        }
      }
      if (count === 0) return
      let mag = count * 2
      applyDamage(opponent, undefined, mag)
      return newTiles
    }

    const newTiles = command(args.tiles, preMutOpponent)
    parseSkillInstructionCode(args, code)
    expect(args.tiles).toEqual(newTiles)
    expect(args.opponent.hp).toBe(preMutOpponent.hp)
  })

  test('Tornado', () => {
    // Shuffles the board, deals MAGIC DMG based on how many WIND + EARTH MANA appear after the shuffle.

    const code = getOperationsFromCode(
      '00 0A 00 00 ' + //            mana
        '43 01 46 01 47 01 00 ' + // versions (damage, count, replace)
        '46 ' + //                   shuffle
        '47 D0 50 ' + //             D0 = count wind and earth nodes 0b0101_0000 / 0x50
        '43 21 25 D0', //            apply damage D0
    )

    const command = (
      tiles: (number | null)[],
      gameHash: Uint8Array,
      opponent: Hero,
    ) => {
      const newHash = hashv([Buffer.from('SHUFFLE'), gameHash])
      const newTiles = hashToTiles(newHash) as (number | null)[]
      let count = 0
      for (let i = 0; i < tiles.length; i++) {
        if (tiles[i] === null) {
          newTiles[i] = null
        } else if (newTiles[i] === 4 || newTiles[i] === 6) {
          // [SWRD, SHLD, SPEC, FIRE, WIND, WATR, EART]
          count++
        }
      }
      applyDamage(opponent, undefined, count)
      return { newTiles, newHash }
    }

    const { newTiles, newHash } = command(
      args.tiles,
      args.gameHash,
      preMutOpponent,
    )

    parseSkillInstructionCode(args, code)
    expect(args.tiles).toEqual(newTiles)
    expect(args.gameHash).toEqual(newHash)
    expect(args.opponent.shell).toBe(preMutOpponent.shell)
    expect(args.opponent.hp).toBe(preMutOpponent.hp)
  })

  test('Extinguish', () => {
    // Converts all FIRE MANA in the board into WATER MANA, recover 2 HP per each converted FIRE MANA.

    const code = getOperationsFromCode(
      '00 00 06 00 ' + //            mana
        '44 01 47 01 48 01 00 ' + // versions (heal, count, replace)
        '01 CF 02 ' + //             CF = 2
        '47 D0 08 ' + //             D0 = count fire nodes
        '48 08 05 ' + //             replace fire nodes (0x8) with water nodes (0x5, exact symbol 0-7)
        '37 D0 CF ' + //             D0 *= CF
        '44 01 D0', //               heal for D0
    )

    const command = (tiles: (number | null)[], player: Hero) => {
      let count = 0
      let newTiles = [...tiles]
      for (let i = 0; i < tiles.length; i++) {
        // [SWRD, SHLD, SPEC, FIRE, WIND, WATR, EART]
        if (tiles[i] === 3) {
          count++
          newTiles[i] = 5
        }
      }
      if (count === 0) return
      let mag = count * 2

      player.hp = Math.min(player.hp + mag, player.maxHp)

      return newTiles
    }

    args.player.hp = preMutPlayer.hp = 20

    const newTiles = command(args.tiles, preMutPlayer)
    parseSkillInstructionCode(args, code)
    expect(args.tiles).toEqual(newTiles)
    expect(args.player.hp).toBe(preMutPlayer.hp)
  })

  test('Quake', () => {
    // Deals 30 MAGIC DMG on both players. Damage is reduced based on each respective heroes' WIND MANA.
    const code = getOperationsFromCode(
      '00 00 00 0A ' + //   mana
        '43 01 00 ' + //    version
        '01 D0 1E ' + //    D0 = 30
        '01 D1 1E ' + //    D1 = 30
        '36 D0 0B ' + //    D0 -= player.windMp
        '36 D1 2B ' + //    D1 -= opponent.windMp
        '43 01 05 D0 ' + // apply damage to player D0
        '43 21 25 D1', //   apply damage to opponent D1
    )

    const playerDmg = Math.max(30 - preMutPlayer.windMp, 0)
    const opponentDmg = Math.max(30 - preMutOpponent.windMp, 0)
    applyDamage(preMutPlayer, undefined, playerDmg)
    applyDamage(preMutOpponent, undefined, opponentDmg)

    parseSkillInstructionCode(args, code)
    expect(args.player.hp).toBe(preMutPlayer.hp)
    expect(args.player.shell).toBe(preMutPlayer.shell)
    expect(args.opponent.hp).toBe(preMutOpponent.hp)
    expect(args.opponent.shell).toBe(preMutOpponent.shell)
  })
})
