import { getHeroAttributes } from '@/utils/gameFunctions'
import { PublicKey } from '@solana/web3.js'

export class Hero {
  constructor(
    public hp: number,
    public hpCap: number,
    public armor: number,
    public shell: number,
    public turnTime: number,
    public baseDmg: number,

    public firMp: number,
    public firMpCap: number,
    public winMp: number,
    public winMpCap: number,
    public watMp: number,
    public watMpCap: number,
    public earMp: number,
    public earMpCap: number,

    public int: number,
    public spd: number,
    public vit: number,
    public str: number,

    public weight: number,
    public offensiveSkill: number,
    public supportiveSkill: number,
    public specialSkill: number,
  ) {}

  static fromPublicKey(publicKey: string | PublicKey) {
    if (typeof publicKey === 'string') {
      publicKey = new PublicKey(publicKey)
    }

    const [int, spd, vit, str] = getHeroAttributes(publicKey)
    const bytes = publicKey.toBytes()

    return new Hero(
      100 + vit * 2,
      100 + vit * 2,
      0,
      0,
      0,
      0,
      0,
      10 + int,
      0,
      10 + int,
      0,
      10 + int,
      0,
      10 + int,
      int,
      spd,
      vit,
      str,
      0,
      bytes[0] % 4,
      (bytes[1] % 4) + 4,
      (bytes[2] % 4) + 8,
    )
  }

  static from(object: Record<keyof Hero, number>) {
    return new Hero(
      object.hp,
      object.hpCap,
      object.armor,
      object.shell,
      object.turnTime,
      object.baseDmg,
      object.firMp,
      object.firMpCap,
      object.winMp,
      object.winMpCap,
      object.watMp,
      object.watMpCap,
      object.earMp,
      object.earMpCap,
      object.int,
      object.spd,
      object.vit,
      object.str,
      object.weight,
      object.offensiveSkill,
      object.supportiveSkill,
      object.specialSkill,
    )
  }

  clone() {
    return Hero.from(this as any)
  }

  applyDamage(
    physical = 0,
    magical = 0,
    ignoreArmor = false,
    ignoreShell = false,
  ) {
    if (!ignoreArmor) {
      if (this.armor < physical) {
        physical -= this.armor
        this.armor = 0
      } else {
        this.armor -= physical
        physical = 0
      }
    }

    if (ignoreShell) {
      if (this.shell < magical) {
        magical -= this.shell
        this.shell = 0
      } else {
        this.shell -= magical
        magical = 0
      }
    }

    this.hp -= physical + magical
  }
}
