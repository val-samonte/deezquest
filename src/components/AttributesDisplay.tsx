import classNames from 'classnames'

import { HeroAttributes } from '@/enums/HeroAttributes'
import { Hero } from '@/game/gameFunctions'
import { computeAttribute } from '@/utils/computeAttribute'

import AttributeDescription from './AttributeDescription'
import AttributeTile from './AttributeTile'
import Image from 'next/image'

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
          <div className='font-bold mb-2 flex pb-1 border-b border-amber-400/10'>
            <span className='flex-auto'>Intelligence</span>
            <div className={classNames('flex items-center gap-3 font-bold')}>
              <span className='flex items-center gap-px'>
                <Image
                  alt='intelligence'
                  width={120}
                  height={120}
                  src='/stat_int.svg'
                  className='w-4 h-4'
                />
                {hero.int}
              </span>
            </div>
          </div>
          <div className='grid grid-cols-2 mb-2'>
            <span>
              <span className='text-neutral-400'>Total MP: </span>
              <span className='font-bold text-lime-600'>{hero.maxMp}</span>
            </span>
            <span>
              <span className='text-neutral-400'>Absorb MP: </span>
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
          <div className='font-bold mb-2 flex pb-1 border-b border-amber-400/10'>
            <span className='flex-auto'>Speed</span>
            <div className={classNames('flex items-center gap-3 font-bold')}>
              <span className='flex items-center gap-px'>
                <Image
                  alt='speed'
                  width={120}
                  height={120}
                  src='/stat_spd.svg'
                  className='w-4 h-4'
                />
                {hero.spd}
              </span>
            </div>
          </div>
          <div className='grid grid-cols-1 mb-2'>
            <span>
              <span className='text-neutral-400'>Turn Points: </span>
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
          <div className='font-bold mb-2 flex pb-1 border-b border-amber-400/10'>
            <span className='flex-auto'>Vitality</span>
            <div className={classNames('flex items-center gap-3 font-bold')}>
              <span className='flex items-center gap-px'>
                <Image
                  alt='vitality'
                  width={120}
                  height={120}
                  src='/stat_vit.svg'
                  className='w-4 h-4'
                />
                {hero.vit}
              </span>
            </div>
          </div>
          <div className='grid grid-cols-1 mb-2'>
            <span>
              <span className='text-neutral-400'>Total HP: </span>
              <span className='font-bold text-lime-600'>{hero.maxHp}</span>
            </span>
          </div>
          <div className='text-xs'>
            <AttributeDescription attr={HeroAttributes.VIT} />
          </div>
        </AttributeTile>
        <AttributeTile attrName={HeroAttributes.STR} value={hero.str}>
          <div className='font-bold mb-2 flex pb-1 border-b border-amber-400/10'>
            <span className='flex-auto'>Strength</span>
            <div className={classNames('flex items-center gap-3 font-bold')}>
              <span className='flex items-center gap-px'>
                <Image
                  alt='strength'
                  width={120}
                  height={120}
                  src='/stat_str.svg'
                  className='w-4 h-4'
                />
                {hero.str}
              </span>
            </div>
          </div>
          <div className='grid grid-cols-2 mb-2'>
            <span>
              <span className='text-neutral-400'>Attack: </span>
              <span className='font-bold text-lime-600'>{hero.baseDmg}</span>
            </span>
            <span>
              <span className='text-neutral-400'>Max Weight: </span>
              <span className='font-bold text-lime-600'>{hero.carryCap}</span>
            </span>
          </div>
          <div className='text-xs'>
            <AttributeDescription attr={HeroAttributes.STR} />
          </div>
        </AttributeTile>
      </div>
      <div className='grid grid-cols-2 gap-x-5 gap-y-2 text-sm px-5'>
        <span className='flex items-center'>
          <span className='text-neutral-400 flex-auto'>Max HP: </span>
          <span className='font-bold text-white'>{hero.maxHp}</span>
        </span>
        <span className='flex items-center'>
          <span className='text-neutral-400 flex-auto'>Max MP: </span>
          <span className='font-bold text-white'>{hero.maxMp}</span>
        </span>
        <span className='flex items-center'>
          <span className='text-neutral-400 flex-auto'>Turn Points: </span>
          <span className='font-bold text-white'>
            {computeAttribute(HeroAttributes.SPD, hero.spd).turnPoints}
          </span>
        </span>
        <span className='flex items-center'>
          <span className='text-neutral-400 flex-auto'>Absorb MP: </span>
          <span className='font-bold text-white'>
            {computeAttribute(HeroAttributes.INT, hero.int).absorbMp}
          </span>
        </span>
        <span className='flex items-center'>
          <span className='text-neutral-400 flex-auto'>Attack: </span>
          <span className='font-bold text-white'>{hero.baseDmg}</span>
        </span>
        <span className='flex items-center'>
          <span className='text-neutral-400 flex-auto'>Weight: </span>
          <span className='font-bold text-white'>0 / {hero.str}</span>
        </span>
      </div>
    </div>
  )
}
