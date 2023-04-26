'use client'

import StatCounter from '@/components/StatCounter'
import { elementColors } from '@/enums/ElementColors'
import { SkillTypes } from '@/enums/SkillTypes'
import { Skill } from '@/types/Skill'
import { Popover } from '@headlessui/react'
import classNames from 'classnames'
import { useState } from 'react'
import { usePopper } from 'react-popper'

interface MiniSkillDisplay {
  iconSrc: string
  skill: Skill
  useDetails: {
    useCount: number
    maxUseCount: number
    useCountPerElement: (number | undefined)[]
    maxUseCountPerElement: (number | undefined)[]
    ratio: number[][]
    partitions: number
  }
}

export default function MiniSkillDisplay({
  iconSrc,
  skill,
  useDetails,
}: MiniSkillDisplay) {
  let [referenceElement, setReferenceElement] = useState()
  let [popperElement, setPopperElement] = useState()
  let { styles, attributes } = usePopper(referenceElement, popperElement)

  return (
    <Popover className={classNames('relative w-1/3 h-full')}>
      <Popover.Button
        className={classNames(
          'absolute inset-0 flex flex-col items-center justify-center outline-none',
          useDetails.useCount === 0 && 'opacity-20',
        )}
        ref={setReferenceElement as any}
      >
        <div className='xs:hidden'>
          <StatCounter img={iconSrc} value={useDetails.useCount} />
        </div>
        <div className='hidden relative xs:flex flex-col w-full aspect-square items-center justify-center p-3'>
          <img src={iconSrc} className='w-full aspect-square ' />
          <span className='xs:font-bold md:text-lg absolute bottom-0 xs:bottom-1 md:bottom-2 right-2 text-right'>
            {useDetails.useCount}
          </span>
        </div>
      </Popover.Button>
      <Popover.Panel
        className='absolute z-50 bg-neutral-800 py-3 px-5 rounded text-xs xl:text-sm shadow'
        ref={setPopperElement as any}
        style={styles.popper}
        {...attributes.popper}
      >
        <div className='font-bold flex mb-2'>
          <span className='flex-auto'>{skill.name}</span>
          <div className={classNames('flex items-center gap-1 font-bold')}>
            {['fire', 'wind', 'water', 'earth'].map((elem, i) =>
              skill.code[i] !== 0 ? (
                <span className='flex items-center xl:gap-2' key={elem}>
                  <img
                    src={`/elem_${elem}.svg`}
                    className='w-4 h-4 lg:w-6 lg:h-6'
                  />
                  {skill.code[i] === 255 ? 'ALL' : skill.code[i]}
                </span>
              ) : null,
            )}
          </div>
        </div>
        {useDetails && (
          <>
            <div className='flex gap-1 mb-3 -skew-x-[45deg]'>
              {useDetails.ratio.map((bar, i) => (
                <div
                  key={i}
                  className={classNames(
                    i + 1 > useDetails.useCount && 'opacity-20',
                    'h-[0.5rem] w-full flex-auto flex bg-black flex-col justify-end',
                  )}
                >
                  {bar.map((elem, j) => (
                    <div
                      className='flex-none'
                      key={j}
                      style={{
                        backgroundColor: elementColors[j],
                        height: elem * 100 + '%',
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
        <div className='min-w-[200px] flex flex-col'>
          <span>{skill.desc}</span>
          {skill.type !== SkillTypes.SPECIAL && (
            <div className='flex flex-col mt-2 gap-2'>
              {skill.cmdLvls.map((cmdLevelDesc, i) => (
                <div className='flex' key={i}>
                  <div className='flex-none'>
                    {Array.from(Array(5)).map((_, j) => (
                      <span
                        key={j}
                        className={classNames(
                          `${i + 2 >= j ? '' : 'opacity-20'}`,
                        )}
                      >
                        {skill.type === SkillTypes.ATTACK ? '🗡️' : '🛡️'}
                      </span>
                    ))}
                  </div>
                  <div className='ml-2'>{cmdLevelDesc}</div>
                </div>
              ))}
            </div>
          )}
          {skill.type === SkillTypes.SPECIAL && (
            <span className='mt-2 pt-2 italic opacity-50'>
              A Special Skill needs 4 or more amulet matches to be used.
            </span>
          )}
        </div>
      </Popover.Panel>
    </Popover>
  )
}
