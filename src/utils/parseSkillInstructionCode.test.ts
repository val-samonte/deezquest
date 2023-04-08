import { SkillTypes } from '../enums/SkillTypes'
import { describe, expect, test, beforeEach } from '@jest/globals'
import { Keypair } from '@solana/web3.js'
import { combinePublicKeysAsHash } from './combinePublicKeysAsHash'
import { hashToTiles, Hero, heroFromPublicKey } from './gameFunctions'
import {
  OperationArguments,
  parseSkillInstructionCode,
} from './parseSkillInstructionCode'

let playerKeypair: Keypair
let opponentKeypair: Keypair
let player: Hero
let opponent: Hero
let hash: Buffer
let args: OperationArguments

beforeEach(() => {
  playerKeypair = new Keypair()
  opponentKeypair = new Keypair()
  player = heroFromPublicKey(playerKeypair.publicKey)
  opponent = heroFromPublicKey(opponentKeypair.publicKey)
  hash = combinePublicKeysAsHash(
    playerKeypair.publicKey.toBase58(),
    opponentKeypair.publicKey.toBase58(),
    false,
  ) as Buffer

  args = {
    commandLevel: 1,
    depths: [0, 0, 0, 0, 0, 0, 0, 0],
    gameHash: hash,
    opponent,
    player,
    skillType: SkillTypes.ATTACK,
    tiles: hashToTiles(hash),
  }
})

describe('Burning Punch', () => {
  const code = getCodeFromString(
    '03 00 00 00 43 01 00 01 D0 03 37 D0 42 35 D0 07 43 21 25 D0 00',
  )

  test('Command Level 1', () => {
    const originalOpponent = heroFromPublicKey(opponentKeypair.publicKey)
    parseSkillInstructionCode(args, code)
    expect(opponent.hp).toBe(originalOpponent.hp - 3 - player.baseDmg)
  })

  test('Command Level 2', () => {
    const originalOpponent = heroFromPublicKey(opponentKeypair.publicKey)
    args.commandLevel = 2
    parseSkillInstructionCode(args, code)
    expect(opponent.hp).toBe(originalOpponent.hp - 6 - player.baseDmg)
  })

  test('Command Level 3', () => {
    const originalOpponent = heroFromPublicKey(opponentKeypair.publicKey)
    args.commandLevel = 3
    parseSkillInstructionCode(args, code)
    expect(opponent.hp).toBe(originalOpponent.hp - 9 - player.baseDmg)
  })
})

describe('Focus', () => {
  const code = getCodeFromString('04 00 00 00 00 35 07 42')

  test('Command Level 1', () => {
    const originalPlayer = heroFromPublicKey(playerKeypair.publicKey)
    parseSkillInstructionCode(args, code)
    expect(player.baseDmg).toBe(originalPlayer.baseDmg + 1)
  })

  test('Command Level 2', () => {
    const originalPlayer = heroFromPublicKey(playerKeypair.publicKey)
    args.commandLevel = 2
    parseSkillInstructionCode(args, code)
    expect(player.baseDmg).toBe(originalPlayer.baseDmg + 2)
  })

  test('Command Level 3', () => {
    const originalPlayer = heroFromPublicKey(playerKeypair.publicKey)
    args.commandLevel = 3
    parseSkillInstructionCode(args, code)
    expect(player.baseDmg).toBe(originalPlayer.baseDmg + 3)
  })
})

function getCodeFromString(codeStr: string) {
  return new Uint8Array(codeStr.split(' ').map((n) => parseInt(n, 16)))
}
