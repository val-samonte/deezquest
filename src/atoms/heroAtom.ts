export class Hero {
  constructor(
    public hp: number,
    public hpCap: number,
    public phyDmgBlck: number,
    public magDmgBlck: number,
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
  ) {}

  static from(object: Record<keyof Hero, number>) {
    return new Hero(
      object.hp,
      object.hpCap,
      object.phyDmgBlck,
      object.magDmgBlck,
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
    )
  }

  applyDamage(physical = 0, magical = 0, pure = 0) {
    if (this.phyDmgBlck < physical) {
      physical -= this.phyDmgBlck
      this.phyDmgBlck = 0
    } else {
      this.phyDmgBlck -= physical
      physical = 0
    }

    if (this.magDmgBlck < magical) {
      magical -= this.magDmgBlck
      this.magDmgBlck = 0
    } else {
      this.magDmgBlck -= magical
      magical = 0
    }

    this.hp -= physical + magical + pure
  }
}
