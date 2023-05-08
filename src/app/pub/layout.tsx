'use client'

import { ReactNode } from 'react'
import ListLayout from '../ListLayout'
import PubContentPage from './PubContentPage'

export default function PubLayout({ children }: { children: ReactNode }) {
  return (
    <ListLayout title='Pub' basePath='/pub' content={<PubContentPage />}>
      {children}
    </ListLayout>
  )
}
