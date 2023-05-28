import { Skill } from '@/types/Skill'
import classNames from 'classnames'
import Image from 'next/image'
import { ReactNode } from 'react'

export interface HeroSkillDisplayProps {
  skill: Skill
  children: ReactNode
  className?: string
  onClick?: () => unknown
}

export function HeroSkillDisplay({
  skill,
  children,
  className,
  onClick,
}: HeroSkillDisplayProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={classNames('flex h-16 items-center relative pl-6', className)}
    >
      <div className='flex justify-center w-10 flex-none'>
        <div
          className={classNames(
            'h-14 aspect-square relative',
            skill?.icon && 'scale-75',
          )}
        >
          <Image
            fill={true}
            alt={skill.name}
            src={skill?.icon ?? `/cmd_${skill.type}.svg`}
            className={classNames(
              'object-contain',
              skill?.icon && '-rotate-45 border border-amber-400/50',
            )}
          />
        </div>
      </div>
      <div className='h-14 w-14 aspect-square absolute left-4 -rotate-45'>
        <div className='h-4 w-4 aspect-square border-l-2 border-t-2 border-amber-400/50 absolute top-0 left-0' />
        <div className='h-4 w-4 aspect-square border-r-2 border-b-2 border-amber-400/50 absolute bottom-0 right-0' />
        <div className='h-2 w-2 aspect-square border-r border-b border-amber-400/50 absolute -bottom-1 -right-1' />
      </div>
      <div className='flex-auto flex flex-col pl-6 gap-1 text-sm'>
        <div className='pl-2 flex justify-between text-white uppercase tracking-widest pr-5'>
          <span>{skill.name}</span>
          <span className='flex items-center gap-1 font-bold'>
            {['fire', 'wind', 'water', 'earth'].map((elem, i) =>
              skill.code[i] !== 0 ? (
                <span className='flex items-center gap-px' key={elem}>
                  <Image
                    alt={elem}
                    width={120}
                    height={120}
                    src={`/elem_${elem}.svg`}
                    className='w-4 h-4'
                  />
                  {skill.code[i] === 255 ? 'A' : skill.code[i]}
                </span>
              ) : null,
            )}
          </span>
        </div>
        <div className='border-b border-amber-400/50' />
        {children}
      </div>
    </button>
  )
}
