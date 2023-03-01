'use client'

import { SkillTypes } from '@/enums/SkillTypes'
import { Skill } from '@/utils/gameFunctions'
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
    console.log(useDetails.ratio, dominant)

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
          <h3 className='text-sm xl:text-lg 2xl:text-xl font-bold flex-auto'>
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
                {skill.type === SkillTypes.SPECIAL && (
                  <span className='mt-2 pt-2 border-t border-t-white/5 italic'>
                    A Special Skill needs 4 or more amulet matches to be used.
                  </span>
                )}
              </div>
            </Popover.Panel>
          </Popover>
        )}
        <p
          className={classNames(
            'flex items-center gap-3 font-bold',
            useDetails?.useCount === 0 && 'opacity-20',
          )}
        >
          {typeof skill.cost.fire === 'number' && (
            <span className='flex items-center xl:gap-2'>
              <img
                src='/elem_fire.svg'
                className='w-4 h-4 lg:w-6 lg:h-6 2xl:w-8 2xl:h-8'
              />
              {skill.cost.fire === 0 ? 'ALL' : skill.cost.fire}
            </span>
          )}
          {typeof skill.cost.wind === 'number' && (
            <span className='flex items-center xl:gap-2'>
              <img
                src='/elem_wind.svg'
                className='w-4 h-4 lg:w-6 lg:h-6 2xl:w-8 2xl:h-8'
              />
              {skill.cost.wind === 0 ? 'ALL' : skill.cost.wind}
            </span>
          )}
          {typeof skill.cost.water === 'number' && (
            <span className='flex items-center xl:gap-2'>
              <img
                src='/elem_water.svg'
                className='w-4 h-4 lg:w-6 lg:h-6 2xl:w-8 2xl:h-8'
              />
              {skill.cost.water === 0 ? 'ALL' : skill.cost.water}
            </span>
          )}
          {typeof skill.cost.earth === 'number' && (
            <span className='flex items-center xl:gap-2'>
              <img
                src='/elem_earth.svg'
                className='w-4 h-4 lg:w-6 lg:h-6 2xl:w-8 2xl:h-8'
              />
              {skill.cost.earth === 0 ? 'ALL' : skill.cost.earth}
            </span>
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
          {skill.type === SkillTypes.SPECIAL && (
            <span className='mt-2 pt-2 border-t border-t-white/5 italic'>
              A Special Skill needs 4 or more amulet matches to be used.
            </span>
          )}
        </p>
      )}
    </div>
  )
}
