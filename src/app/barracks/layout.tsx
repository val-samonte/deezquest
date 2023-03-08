import { userWalletAtom } from '@/atoms/userWalletAtom'
import { useAtomValue } from 'jotai'
import { ReactNode, Suspense } from 'react'
import ListLayout from '../ListLayout'
import HeroContentPage from './HeroContentPage'

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
