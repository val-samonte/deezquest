'use client'

import { ReactNode } from 'react'
import ListLayout from '../ListLayout'
import TutorialContentPage from './TutorialContentPage'

export default function TutorialLayout({ children }: { children: ReactNode }) {
  return (
    <ListLayout
      title='Tutorial'
      basePath='/tutorial'
      content={<TutorialContentPage />}
    >
      {children}
    </ListLayout>
  )
}
