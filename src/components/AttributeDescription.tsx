import { HeroAttributes } from '@/enums/HeroAttributes'

export default function AttributeDescription({
  attr,
}: {
  attr: HeroAttributes
}) {
  switch (attr) {
    case HeroAttributes.INT:
      return (
        <>
          Affects the maximum{' '}
          <span className='italic font-bold'>Mana Points</span> of the hero.
          Mana capacity increases by 1 point per each point of INT. Whenever the
          hero absorbs mana, a bonus of 1/2/3 points per each element are gained
          for level 4/7/10 of INT.
        </>
      )
    case HeroAttributes.SPD:
      return (
        <>
          Affects the <span className='italic font-bold'>Turn Points</span> of
          the hero. The higher the hero&apos;s Turn Point value against the
          opponent&apos;s, the more likely the hero will get an extra turn.
        </>
      )
    case HeroAttributes.VIT:
      return (
        <>
          Affects the maximum{' '}
          <span className='italic font-bold'>Hit Points</span> of the hero. Max
          HP increases by 2 point per each point of VIT. An additional bonus HP
          of 3/6/9 for level 4/7/10 of VIT.
        </>
      )
    case HeroAttributes.STR:
      return (
        <>
          Affects the{' '}
          <span className='italic font-bold'>Base Attack Damage</span> and{' '}
          <span className='italic font-bold'>Weight Capacity</span> of the hero.
          Base Attack Damage is added to the total AtkDmg; has initial value of
          1 + increments of 1/2/3 for level 4/7/10 of STR.
        </>
      )
  }
}
