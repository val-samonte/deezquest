'use client'

import dynamic from 'next/dynamic'
import { ReactNode, Suspense } from 'react'
import ListLayout from '../ListLayout'

const HeroContentPage = dynamic(() => import('./HeroContentPage'), {
  ssr: false,
})

export default function BarracksLayout({ children }: { children: ReactNode }) {
  const basePath = '/barracks'
  return (
    <ListLayout
      title='Barracks'
      basePath={basePath}
      content={<HeroContentPage basePath={basePath} />}
    >
      <Suspense fallback={'Loading'}>{children}</Suspense>
    </ListLayout>
  )
}
