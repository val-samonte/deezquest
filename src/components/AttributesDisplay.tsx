import { HeroAttributes } from '@/enums/HeroAttributes'
import { computeAttribute } from '@/utils/computeAttribute'
import { Hero } from '@/game/gameFunctions'
import classNames from 'classnames'
import AttributeDescription from './AttributeDescription'
import AttributeTile from './AttributeTile'

export default function AttributesDisplay({
  hero,
  className,
}: {
  hero: Hero
  className?: string
}) {
  return (
    <div className={classNames('flex flex-col gap-y-5', className)}>
      <div className={classNames('grid grid-cols-4 gap-2')}>
        <AttributeTile attrName={HeroAttributes.INT} value={hero.int}>
          <div className='font-bold mb-2 flex pb-1 border-b border-b-white/5'>
            <span className='flex-auto'>Intelligence</span>
            <div className={classNames('flex items-center gap-3 font-bold')}>
              <span className='flex items-center xl:gap-2'>
                <img src='/stat_int.svg' className='w-4 h-4 lg:w-6 lg:h-6' />
                {hero.int}
              </span>
            </div>
          </div>
          <div className='grid grid-cols-2 mb-2'>
            <span>
              <span className='text-neutral-300'>Total MP: </span>
              <span className='font-bold text-lime-600'>{hero.maxMp}</span>
            </span>
            <span>
              <span className='text-neutral-300'>Absorb MP: </span>
              <span className='font-bold text-lime-600'>
                {computeAttribute(HeroAttributes.INT, hero.int).absorbMp}
              </span>
            </span>
          </div>
          <div className='text-xs'>
            <AttributeDescription attr={HeroAttributes.INT} />
          </div>
        </AttributeTile>
        <AttributeTile attrName={HeroAttributes.SPD} value={hero.spd}>
          <div className='font-bold mb-2 flex pb-1 border-b border-b-white/5'>
            <span className='flex-auto'>Speed</span>
            <div className={classNames('flex items-center gap-3 font-bold')}>
              <span className='flex items-center xl:gap-2'>
                <img src='/stat_spd.svg' className='w-4 h-4 lg:w-6 lg:h-6' />
                {hero.spd}
              </span>
            </div>
          </div>
          <div className='grid grid-cols-1 mb-2'>
            <span>
              <span className='text-neutral-300'>Turn Points: </span>
              <span className='font-bold text-lime-600'>
                {computeAttribute(HeroAttributes.SPD, hero.spd).turnPoints}
              </span>
            </span>
          </div>
          <div className='text-xs'>
            <AttributeDescription attr={HeroAttributes.SPD} />
          </div>
        </AttributeTile>
        <AttributeTile attrName={HeroAttributes.VIT} value={hero.vit}>
          <div className='font-bold mb-2 flex pb-1 border-b border-b-white/5'>
            <span className='flex-auto'>Vitality</span>
            <div className={classNames('flex items-center gap-3 font-bold')}>
              <span className='flex items-center xl:gap-2'>
                <img src='/stat_vit.svg' className='w-4 h-4 lg:w-6 lg:h-6' />
                {hero.vit}
              </span>
            </div>
          </div>
          <div className='grid grid-cols-1 mb-2'>
            <span>
              <span className='text-neutral-300'>Total HP: </span>
              <span className='font-bold text-lime-600'>{hero.maxHp}</span>
            </span>
          </div>
          <div className='text-xs'>
            <AttributeDescription attr={HeroAttributes.VIT} />
          </div>
        </AttributeTile>
        <AttributeTile attrName={HeroAttributes.STR} value={hero.str}>
          <div className='font-bold mb-2 flex pb-1 border-b border-b-white/5'>
            <span className='flex-auto'>Strength</span>
            <div className={classNames('flex items-center gap-3 font-bold')}>
              <span className='flex items-center xl:gap-2'>
                <img src='/stat_str.svg' className='w-4 h-4 lg:w-6 lg:h-6' />
                {hero.str}
              </span>
            </div>
          </div>
          <div className='grid grid-cols-2 mb-2'>
            <span>
              <span className='text-neutral-300'>Base DMG: </span>
              <span className='font-bold text-lime-600'>{hero.baseDmg}</span>
            </span>
            <span>
              <span className='text-neutral-300'>Carry Cap: </span>
              <span className='font-bold text-lime-600'>{hero.carryCap}</span>
            </span>
          </div>
          <div className='text-xs'>
            <AttributeDescription attr={HeroAttributes.STR} />
          </div>
        </AttributeTile>
      </div>
      <div className='grid grid-cols-2 gap-x-5 gap-y-2'>
        <span className='flex items-center'>
          <span className='text-neutral-300 flex-auto'>Total HP: </span>
          <span className='font-bold text-lime-600'>{hero.maxHp}</span>
        </span>
        <span className='flex items-center'>
          <span className='text-neutral-300 flex-auto'>Turn Points: </span>
          <span className='font-bold text-lime-600'>
            {computeAttribute(HeroAttributes.SPD, hero.spd).turnPoints}
          </span>
        </span>
        <span className='flex items-center'>
          <span className='text-neutral-300 flex-auto'>Total MP: </span>
          <span className='font-bold text-lime-600'>{hero.maxMp}</span>
        </span>
        <span className='flex items-center'>
          <span className='text-neutral-300 flex-auto'>Absorb MP: </span>
          <span className='font-bold text-lime-600'>
            {computeAttribute(HeroAttributes.INT, hero.int).absorbMp}
          </span>
        </span>
        <span className='flex items-center'>
          <span className='text-neutral-300 flex-auto'>Base Dmg: </span>
          <span className='font-bold text-lime-600'>{hero.baseDmg}</span>
        </span>
        <span className='flex items-center'>
          <span className='text-neutral-300 flex-auto'>Carry Cap: </span>
          <span className='font-bold text-lime-600'>{hero.str}</span>
        </span>
      </div>
    </div>
  )
}
