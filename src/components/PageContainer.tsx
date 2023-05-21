import { ReactNode } from 'react'

export default function PageContainer({ children }: { children: ReactNode }) {
  return <main className='h-full flex flex-col'>{children}</main>
}
