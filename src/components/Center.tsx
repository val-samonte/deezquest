import { ReactNode } from 'react'

export default function Center({ children }: { children: ReactNode }) {
  return (
    <div className='h-full flex flex-col flex-auto items-center justify-center overflow-hidden'>
      <div className='w-full mx-auto overflow-hidden'>
        <div className='p-1 w-full h-full flex flex-col items-center justify-center'>
          {children}
        </div>
      </div>
    </div>
  )
}
