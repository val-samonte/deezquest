import { HeroAttributes } from '@/enums/HeroAttributes'

export default function AttributeDescription({
  attr,
}: {
  attr: HeroAttributes
}) {
  switch (attr) {
    case HeroAttributes.INT:
      return (
        <div className='flex flex-col gap-2'>
          <p>
            Affects the maximum{' '}
            <span className='italic font-bold'>Mana Points</span> of the hero.
            Mana capacity increases by 1 point per each point of INT.
          </p>
          <p>
            Whenever the hero absorbs mana, a bonus mana is absorbed per each 3
            points of INT, starting from INT 4.
          </p>
        </div>
      )
    case HeroAttributes.SPD:
      return (
        <div className='flex flex-col gap-2'>
          <p>
            Affects the <span className='italic font-bold'>Turn Points</span> of
            the hero.
          </p>
          <p>
            The higher the hero&apos;s Turn Point value against the
            opponent&apos;s, the more likely the hero will get an extra turn.
          </p>
        </div>
      )
    case HeroAttributes.VIT:
      return (
        <div className='flex flex-col gap-2'>
          <p>
            Affects the maximum{' '}
            <span className='italic font-bold'>Hit Points</span> of the hero.
            Max HP increases by 2 point per each point of VIT.
          </p>
          <p>
            A 3 HP bonus is added per each 6 points of VIT, starting from VIT 7.
          </p>
        </div>
      )
    case HeroAttributes.STR:
      return (
        <div className='flex flex-col gap-2'>
          <p>
            Affects the{' '}
            <span className='italic font-bold'>Base Attack Damage</span> and{' '}
            <span className='italic font-bold'>Weight Capacity</span> of the
            hero.
          </p>
          <p>
            Base Attack Damage has initial value of 1 plus additional point per
            each 3 points of STR, starting from STR 4.
          </p>
        </div>
      )
  }
}
