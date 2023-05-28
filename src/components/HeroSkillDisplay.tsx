import { Skill } from '@/types/Skill'
import classNames from 'classnames'
import Image from 'next/image'
import { Fragment, ReactNode } from 'react'

export interface HeroSkillDisplayProps {
  skill: Skill
  children?: ReactNode
  size?: 'sm' | 'lg'
  className?: string
  onClick?: () => unknown
}

export function HeroSkillDisplay({
  skill,
  children,
  className,
  size,
  onClick,
}: HeroSkillDisplayProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={classNames(
        size === 'sm' ? 'flex-col w-full -mt-7' : 'pl-6',
        'flex h-16 items-center relative',
        className,
      )}
    >
      <div className={classNames('flex justify-center w-10 flex-none')}>
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
      {size !== 'sm' && (
        <div className='h-14 w-14 aspect-square absolute left-4 -rotate-45'>
          <div className='h-4 w-4 aspect-square border-l-2 border-t-2 border-amber-400/50 absolute top-0 left-0' />
          <div className='h-4 w-4 aspect-square border-r-2 border-b-2 border-amber-400/50 absolute bottom-0 right-0' />
          <div className='h-2 w-2 aspect-square border-r border-b border-amber-400/50 absolute -bottom-1 -right-1' />
        </div>
      )}
      <div
        className={classNames(
          size !== 'sm' && 'pl-6',
          'flex-auto flex flex-col gap-1 text-sm',
        )}
      >
        <div
          className={classNames(
            size === 'sm' ? 'flex-col items-center' : 'pl-2 pr-5',
            'flex justify-between text-white uppercase tracking-widest',
          )}
        >
          <span className={classNames(size === 'sm' && 'mt-1')}>
            {skill.name}
          </span>
          <span
            className={classNames(
              size === 'sm'
                ? 'absolute top-8 inset-x-0 grid grid-cols-5'
                : 'flex',
              'items-center gap-1 font-bold',
            )}
          >
            {['fire', 'wind', 'water', 'earth'].map((elem, i) =>
              skill.code[i] !== 0 || size === 'sm' ? (
                <Fragment key={elem}>
                  <span
                    className={classNames(
                      skill.code[i] === 0 && size === 'sm' && 'opacity-20',
                      'flex items-center gap-px justify-center',
                    )}
                  >
                    <Image
                      alt={elem}
                      width={120}
                      height={120}
                      src={`/elem_${elem}.svg`}
                      className='w-4 h-4'
                    />
                    {skill.code[i] === 255 ? 'A' : skill.code[i]}
                  </span>
                  {size === 'sm' && i === 1 && <span />}
                </Fragment>
              ) : null,
            )}
          </span>
        </div>
        {size !== 'sm' && <div className='border-b border-amber-400/50' />}
        {children}
      </div>
    </button>
  )
}
