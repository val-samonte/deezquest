'use client'

import { ReactNode } from 'react'
import ListLayout from '../ListLayout'
import ShopContentPage from './ShopContentPage'

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <ListLayout title='Shop' basePath='/shop' content={<ShopContentPage />}>
      {children}
    </ListLayout>
  )
}
