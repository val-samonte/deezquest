import { test, expect } from '@jest/globals'
import { Keypair } from '@solana/web3.js'
import { getHeroAttributes, hashToTiles } from './gameFunctions'
import { hashv } from './hashv'
import canonicalize from 'canonicalize'

test('should have the same output', () => {
  const player = Keypair.generate()
  const gameHash = hashv([Buffer.from('test')])

  const json1 = {
    turn: 9,
    tiles: hashToTiles(gameHash),
    player: {
      address: player.publicKey.toBase58(),
      hero: getHeroAttributes(player.publicKey),
    },
    opponent: {
      hero: getHeroAttributes(player.publicKey),
      address: player.publicKey.toBase58(),
    },
  }

  const json2 = {
    player: {
      hero: getHeroAttributes(player.publicKey),
      address: player.publicKey.toBase58(),
    },
    opponent: {
      address: player.publicKey.toBase58(),
      hero: getHeroAttributes(player.publicKey),
    },
    turn: 9,
    tiles: hashToTiles(gameHash),
  }

  const canonJson1 = canonicalize(json1)
  const canonJson2 = canonicalize(json2)

  expect(canonJson1).toBe(canonJson2)

  const parsedCanonJson1 = JSON.parse(canonJson1!)

  expect(json1.turn).toBe(parsedCanonJson1.turn)
  expect(json1.player.address).toBe(parsedCanonJson1.player.address)

  const hashTiles1 = hashv([new Uint8Array(json1.tiles)])
  const hashTiles2 = hashv([new Uint8Array(parsedCanonJson1.tiles)])

  expect(hashTiles1).toEqual(hashTiles2)
})
