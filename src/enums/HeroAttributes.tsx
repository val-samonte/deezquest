export enum HeroAttributes {
  INT = 'INT',
  SPD = 'SPD',
  VIT = 'VIT',
  STR = 'STR',
}

export const HeroAttributesData = {
  [HeroAttributes.INT]: {
    desc: (
      <>
        Affects the maximum{' '}
        <span className='italic font-bold'>Mana Points</span> of the hero. Mana
        capacity increases by 1 point per each point of INT. Whenever the hero
        absorbs mana, a bonus of 1/2/3 points per each element are gained for
        level 4/7/10 of INT.
      </>
    ),
    compute: (value: number) => ({
      totalMp: 10 + value,
      absorbMp: Math.floor((value - 1) / 3),
    }),
  },
  [HeroAttributes.SPD]: {
    desc: (
      <>
        Affects the <span className='italic font-bold'>Turn Points</span> of the
        hero. The higher the hero&apos;s Turn Point value against the
        opponent&apos;s, the more likely the hero will get an extra turn.
      </>
    ),
    compute: (value: number) => ({
      turnPoints: Math.min(value + 15, 50),
    }),
  },
  [HeroAttributes.VIT]: {
    desc: (
      <>
        Affects the maximum <span className='italic font-bold'>Hit Points</span>{' '}
        of the hero. Max HP increases by 3 point per each point of VIT. An
        additional bonus HP of 5/10/15 for level 4/7/10 of VIT.
      </>
    ),
    compute: (value: number) => ({
      totalHp: 55 + value * 3 + Math.floor((value - 1) / 3) * 5,
    }),
  },
  [HeroAttributes.STR]: {
    desc: (
      <>
        Affects the <span className='italic font-bold'>Base Damage</span> and
        <span className='italic font-bold'>Carrying Capacity</span> of the hero.
        Base Damage is added to the total AtkDmg; has initial value of 1/2/3 for
        level 4/7/10 of STR.
      </>
    ),
    compute: (value: number) => ({
      baseDmg: Math.floor((value - 1) / 3),
      carryCap: value,
    }),
  },
}
