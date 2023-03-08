'use client'

import { ReactNode } from 'react'
import ListLayout from '../ListLayout'
import InventoryContentPage from './InventoryContentPage'

export default function InventoryLayout({ children }: { children: ReactNode }) {
  return (
    <ListLayout
      title='Inventory'
      basePath='/inventory'
      content={<InventoryContentPage />}
    >
      {children}
    </ListLayout>
  )
}
