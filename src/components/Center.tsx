import { ReactNode } from 'react'

export default function Center({ children }: { children: ReactNode }) {
  return (
    <div className='flex flex-col flex-auto items-center justify-center'>
      {children}
    </div>
  )
}
