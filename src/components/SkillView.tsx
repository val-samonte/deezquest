'use client'

import { Skill } from '@/utils/gameFunctions'
import { Popover } from '@headlessui/react'
import classNames from 'classnames'
import { useState } from 'react'
import { usePopper } from 'react-popper'

interface SkillViewProps {
  skill: Skill
  hideDesc?: boolean
}

export default function SkillView({ skill, hideDesc }: SkillViewProps) {
  let [referenceElement, setReferenceElement] = useState()
  let [popperElement, setPopperElement] = useState()
  let { styles, attributes } = usePopper(referenceElement, popperElement)
  return (
    <div
      className={classNames(
        'flex flex-col w-full',
        hideDesc && 'justify-center',
      )}
    >
      <div className='flex items-center border-b border-b-white/5 pb-2 mb-3'>
        {!hideDesc ? (
          <h3 className='text-sm xl:text-lg 2xl:text-xl font-bold flex-auto'>
            {skill.name}
          </h3>
        ) : (
          <Popover className='relative flex-auto'>
            <Popover.Button
              className='text-sm xl:text-lg 2xl:text-xl font-bold'
              ref={setReferenceElement as any}
            >
              {skill.name}
            </Popover.Button>
            <Popover.Panel
              className='absolute z-10 bg-neutral-800 py-3 px-5 rounded text-xs xl:text-sm shadow'
              ref={setPopperElement as any}
              style={styles.popper}
              {...attributes.popper}
            >
              <div className='min-w-[200px]'>{skill.desc}</div>
            </Popover.Panel>
          </Popover>
        )}
        <p className='flex items-center gap-3 font-bold'>
          {typeof skill.cost.fire === 'number' && (
            <span className='flex items-center xl:gap-2'>
              <img
                src='/elem_fire.svg'
                className='w-4 h-4 lg:w-6 lg:h-6 2xl:w-8 2xl:h-8'
              />
              {isNaN(skill.cost.fire) ? 'ALL' : skill.cost.fire}
            </span>
          )}
          {typeof skill.cost.wind === 'number' && (
            <span className='flex items-center xl:gap-2'>
              <img
                src='/elem_wind.svg'
                className='w-4 h-4 lg:w-6 lg:h-6 2xl:w-8 2xl:h-8'
              />
              {isNaN(skill.cost.wind) ? 'ALL' : skill.cost.wind}
            </span>
          )}
          {typeof skill.cost.water === 'number' && (
            <span className='flex items-center xl:gap-2'>
              <img
                src='/elem_water.svg'
                className='w-4 h-4 lg:w-6 lg:h-6 2xl:w-8 2xl:h-8'
              />
              {isNaN(skill.cost.water) ? 'ALL' : skill.cost.water}
            </span>
          )}
          {typeof skill.cost.earth === 'number' && (
            <span className='flex items-center xl:gap-2'>
              <img
                src='/elem_earth.svg'
                className='w-4 h-4 lg:w-6 lg:h-6 2xl:w-8 2xl:h-8'
              />
              {isNaN(skill.cost.earth) ? 'ALL' : skill.cost.earth}
            </span>
          )}
        </p>
      </div>
      {!hideDesc && <p className='text-sm text-neutral-300'>{skill.desc}</p>}
    </div>
  )
}
