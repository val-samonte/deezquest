'use client'

import classNames from 'classnames'
import { useState } from 'react'
import { usePopper } from 'react-popper'
import Image from 'next/image'

import { elementColors } from '@/enums/ElementColors'
import { Skill } from '@/types/Skill'
import { Popover } from '@headlessui/react'

import CommandLevelsDescription from './CommandLevelsDescription'

interface SkillViewProps {
  skill: Skill
  hideDesc?: boolean
  useDetails?: {
    useCount: number
    maxUseCount: number
    useCountPerElement: (number | undefined)[]
    maxUseCountPerElement: (number | undefined)[]
    ratio: number[][]
    partitions: number
  }
}

// const mpRef = ['fireMp', 'windMp', 'watrMp', 'eartMp']

export default function SkillView({
  skill,
  hideDesc,
  useDetails,
}: SkillViewProps) {
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
              <div className='min-w-[250px] flex flex-col'>
                <span>{skill.desc}</span>
                <CommandLevelsDescription skill={skill} />
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
              <div
                className='flex items-center'
                key={i}
                style={{ color: elementColors[i] }}
              >
                <div className='w-4 h-4 lg:w-5 lg:h-5 2xl:w-7 2xl:h-7 opacity-25 relative'>
                  <Image
                    alt={elem}
                    fill={true}
                    src={`/elem_${elem}.svg`}
                    className='object-contain'
                  />
                </div>
                {skill.code[i] === 255 ? 'A' : skill.code[i]}
              </div>
            ) : null,
          )}
        </p>
      </div>
      {useDetails && (
        <>
          <div className='flex gap-1 mb-2 pr-2 -skew-x-[45deg]'>
            {useDetails.ratio.map((bar, i) => (
              <div
                key={i}
                className={classNames(
                  i + 1 > useDetails.useCount && 'opacity-20',
                  'h-[0.75vw] w-full flex-auto flex bg-black flex-col justify-end',
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
      {!hideDesc && (
        <div className='text-sm text-neutral-300 flex flex-col'>
          <span>{skill.desc}</span>
          <CommandLevelsDescription skill={skill} />
        </div>
      )}
    </div>
  )
}
