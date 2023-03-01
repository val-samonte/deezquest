'use client'

import StatCounter from '@/components/StatCounter'
import { Skill } from '@/utils/gameFunctions'
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
    ratio: (number | undefined)[]
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
          'absolute inset-0 flex flex-col items-center justify-center',
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
        className='absolute z-10 bg-neutral-800 py-3 px-5 rounded text-xs xl:text-sm shadow'
        ref={setPopperElement as any}
        style={styles.popper}
        {...attributes.popper}
      >
        <div className='font-bold mb-2 flex pb-1 border-b border-b-white/5'>
          <span className='flex-auto'>{skill.name}</span>
          <div className={classNames('flex items-center gap-3 font-bold')}>
            {typeof skill.cost.fire === 'number' && (
              <span className='flex items-center xl:gap-2'>
                <img src='/elem_fire.svg' className='w-4 h-4 lg:w-6 lg:h-6' />
                ``
                {skill.cost.fire === 0 ? 'ALL' : skill.cost.fire}
              </span>
            )}
            {typeof skill.cost.wind === 'number' && (
              <span className='flex items-center xl:gap-2'>
                <img src='/elem_wind.svg' className='w-4 h-4 lg:w-6 lg:h-6' />
                {skill.cost.wind === 0 ? 'ALL' : skill.cost.wind}
              </span>
            )}
            {typeof skill.cost.water === 'number' && (
              <span className='flex items-center xl:gap-2'>
                <img src='/elem_water.svg' className='w-4 h-4 lg:w-6 lg:h-6' />
                {skill.cost.water === 0 ? 'ALL' : skill.cost.water}
              </span>
            )}
            {typeof skill.cost.earth === 'number' && (
              <span className='flex items-center xl:gap-2'>
                <img src='/elem_earth.svg' className='w-4 h-4 lg:w-6 lg:h-6' />
                {skill.cost.earth === 0 ? 'ALL' : skill.cost.earth}
              </span>
            )}
          </div>
        </div>
        <div className='min-w-[200px]'>{skill.desc}</div>
      </Popover.Panel>
    </Popover>
  )
}
