import { HeroAttributes } from '@/enums/HeroAttributes'
import { Popover } from '@headlessui/react'
import classNames from 'classnames'
import { ReactNode, useState } from 'react'
import { usePopper } from 'react-popper'

interface AttributeTileProps {
  attrName: HeroAttributes
  value: number
  children: ReactNode
}

export default function AttributeTile({
  children,
  attrName,
  value,
}: AttributeTileProps) {
  let [referenceElement, setReferenceElement] = useState()
  let [popperElement, setPopperElement] = useState()
  let { styles, attributes } = usePopper(referenceElement, popperElement)

  return (
    <Popover className='relative flex-auto'>
      <Popover.Button
        className={classNames(
          'outline-none w-full flex flex-col items-center justify-center p-2 rounded bg-black/20',
        )}
        ref={setReferenceElement as any}
      >
        <img
          src={`/stat_${attrName.toLowerCase()}.svg`}
          className='w-10 h-10 aspect-square object-contain'
        />
        <div className='flex justify-center gap-2 items-center'>
          <span className='opacity-50 uppercase'>{attrName}</span>{' '}
          <span className='font-bold'>{value}</span>
        </div>
      </Popover.Button>
      <Popover.Panel
        className='absolute z-50 bg-neutral-800 py-3 px-5 rounded text-xs xl:text-sm shadow'
        ref={setPopperElement as any}
        style={styles.popper}
        {...attributes.popper}
      >
        <div className='w-[200px] flex flex-col'>{children}</div>
      </Popover.Panel>
    </Popover>
  )
}
