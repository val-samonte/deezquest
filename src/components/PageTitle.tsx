import { ReactNode } from 'react'
import classNames from 'classnames'
import { IM_Fell_DW_Pica } from 'next/font/google'
import Image from 'next/image'

const font = IM_Fell_DW_Pica({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

export interface PageTitleProps {
  title: string
  children?: ReactNode
}

export default function PageTitle({ title, children }: PageTitleProps) {
  return (
    <div className='h-14 flex justify-between backdrop-grayscale backdrop-brightness-125'>
      <button
        type='button'
        className={classNames('relative text-white', font.className)}
        style={{
          WebkitFontSmoothing: 'antialised',
          textShadow: '0px -2px rgba(0,0,0,0.5)',
        }}
      >
        <Image
          alt={'menu_title_bg'}
          width={1400}
          height={280}
          src={`${process.env.NEXT_PUBLIC_CDN}/mask_brush_1.png`}
          className='h-[120%] w-full absolute -inset-y-2 right-0 -left-10 opacity-60'
        />
        <div className='relative flex h-full items-center pl-3 gap-1'>
          <div className='relative h-full aspect-square p-3'>
            <Image
              alt='DeezQuest Logo'
              width={342}
              height={332}
              className='object-contain h-full'
              src={`${process.env.NEXT_PUBLIC_CDN}/logo.png`}
            />
          </div>
          <h1 className='text-2xl select-none'>{title}</h1>
          <div className='flex-auto w-28' />
        </div>
      </button>
      <div className='h-full flex'>{children}</div>
    </div>
  )
}
