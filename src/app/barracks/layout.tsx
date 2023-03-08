'use client'

import { ReactNode } from 'react'
import ListLayout from '../ListLayout'
import HeroContentPage from './HeroContentPage'

export default function BarracksLayout({ children }: { children: ReactNode }) {
  return (
    <ListLayout
      title='Barracks'
      basePath='/barracks'
      content={<HeroContentPage />}
    >
      {children}
    </ListLayout>
  )
}
