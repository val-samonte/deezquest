import { Skill } from '@/types/Skill'
import classNames from 'classnames'
import Image from 'next/image'

export interface SkillIconProps {
  skill: Skill
  flip?: boolean
  showCount?: boolean
  className?: string
}

export default function SkillIcon({
  skill,
  flip,
  showCount,
  className,
}: SkillIconProps) {
  return (
    <div
      className={classNames(
        'w-full h-full flex relative',
        flip && 'flex-row-reverse',
        className,
      )}
    >
      {/* mana use indicator */}
      {/* <div className='flex-none grid grid-rows-4 h-full pr-[50%]'>
        <div className='h-full aspect-[2/1] row-span-1 bg-fire-400 text-[10%]'>
          7
        </div>
        <div className='h-full aspect-[2/1] row-span-1 bg-wind-400' />
        <div className='h-full aspect-[2/1] row-span-1 bg-water-400' />
        <div className='h-full aspect-[2/1] row-span-1 bg-earth-400' />
      </div> */}
      {/* icon container */}
      <div className='h-full aspect-square relative -rotate-45'>
        <Image
          src={skill.icon ?? ''}
          alt={skill.name}
          fill={true}
          className='object-cover border border-amber-400/50 scale-75'
        />
      </div>
      {showCount && (
        <div
          className={classNames(
            'text-xs sm:text-sm absolute bottom-0 font-bold',
            flip ? 'left-0' : 'right-0',
          )}
        >
          99
        </div>
      )}
    </div>
  )
}
