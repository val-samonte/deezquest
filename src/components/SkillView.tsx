'use client'

import { SkillTypes } from '@/enums/SkillTypes'
import { Skill } from '@/types/Skill'
import { Popover } from '@headlessui/react'
import classNames from 'classnames'
import { useMemo, useState } from 'react'
import { usePopper } from 'react-popper'

interface SkillViewProps {
  skill: Skill
  hideDesc?: boolean
  useDetails?: {
    useCount: number
    maxUseCount: number
    useCountPerElement: (number | undefined)[]
    maxUseCountPerElement: (number | undefined)[]
    ratio: (number | undefined)[]
  }
}

export default function SkillView({
  skill,
  hideDesc,
  useDetails,
}: SkillViewProps) {
  let [referenceElement, setReferenceElement] = useState()
  let [popperElement, setPopperElement] = useState()
  let { styles, attributes } = usePopper(referenceElement, popperElement)

  const emptyBars = useMemo(() => {
    if (!useDetails) return 0
    return useDetails.maxUseCount - useDetails.useCount
  }, [useDetails])

  const bars = useMemo(() => {
    if (!useDetails) return { count: 0, color: null }
    const colors = [
      'rgb(246,0,0)',
      'rgb(35,220,31)',
      'rgb(19,113,255)',
      'rgb(253,169,10)',
    ]
    const dominant = useDetails.ratio.findIndex((i) => typeof i === 'number')

    return {
      count: useDetails.useCount,
      color: colors[dominant],
    }
  }, [useDetails])

  return (
    <div
      className={classNames(
        'flex flex-col w-full',
        hideDesc && 'justify-center',
      )}
    >
      <div
        className={classNames(
          'flex items-center',
          !useDetails ? 'pb-2 mb-3 border-b border-b-white/5' : 'pb-1',
        )}
      >
        {!hideDesc ? (
          <h3 className='text-base xl:text-lg 2xl:text-xl font-bold flex-auto'>
            {skill.name}
          </h3>
        ) : (
          <Popover className='relative flex-auto'>
            <Popover.Button
              className={classNames(
                'text-sm xl:text-lg 2xl:text-xl font-bold outline-none',
                useDetails?.useCount === 0 && 'opacity-20',
              )}
              ref={setReferenceElement as any}
            >
              {skill.name}
            </Popover.Button>
            <Popover.Panel
              className='absolute z-50 bg-neutral-800 py-3 px-5 rounded text-xs xl:text-sm shadow'
              ref={setPopperElement as any}
              style={styles.popper}
              {...attributes.popper}
            >
              <div className='min-w-[200px] flex flex-col'>
                <span>{skill.desc}</span>
                {skill.type !== SkillTypes.SPECIAL && (
                  <div className='flex flex-col mt-2'>
                    {skill.cmdLvls.map((cmdLevelDesc, i) => (
                      <div className='flex'>
                        <div>
                          {Array.from(Array(3)).map((_, j) => (
                            <span key={j}>{i >= j ? <>★</> : <>☆</>}</span>
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
        )}
        <p
          className={classNames(
            'flex items-center gap-1 font-bold',
            useDetails?.useCount === 0 && 'opacity-20',
          )}
        >
          {['fire', 'wind', 'water', 'earth'].map((elem, i) =>
            skill.code[i] !== 0 ? (
              <span className='flex items-center'>
                <img
                  src={`/elem_${elem}.svg`}
                  className='w-4 h-4 lg:w-5 lg:h-5 2xl:w-7 2xl:h-7 opacity-25'
                />
                {skill.code[i] === 255 ? 'ALL' : skill.code[i]}
              </span>
            ) : null,
          )}
        </p>
      </div>
      {useDetails && (
        <>
          <div className='flex gap-2 mb-2'>
            {Array.from(Array(bars.count)).map((_, i) => (
              <div
                className='h-2 flex-auto'
                key={`key_${i}`}
                style={{ backgroundColor: bars.color ?? '' }}
              />
            ))}
            {Array.from(Array(emptyBars)).map((_, i) => (
              <div className='h-2 bg-black/20 flex-auto' key={`key_${i}`} />
            ))}
          </div>
        </>
      )}
      {!hideDesc && (
        <p className='text-sm text-neutral-300 flex flex-col'>
          <span>{skill.desc}</span>
          {skill.type !== SkillTypes.SPECIAL && (
            <div className='flex flex-col mt-2'>
              {skill.cmdLvls.map((cmdLevelDesc, i) => (
                <div className='flex'>
                  <div>
                    {Array.from(Array(3)).map((_, j) => (
                      <span key={j}>{i >= j ? <>★</> : <>☆</>}</span>
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
        </p>
      )}
    </div>
  )
}
