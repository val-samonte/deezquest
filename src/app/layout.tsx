import '@solana/wallet-adapter-react-ui/styles.css'
import './globals.css'

import dynamic from 'next/dynamic'
import Backgrounds from './Backgrounds'
import BgmManager from './BgmManager'
import DependenciesContainer from './DependenciesContainer'

const MainMenu = dynamic(() => import('./MainMenu'), { ssr: false })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <head />
      <body className='bg-black text-neutral-200'>
        <DependenciesContainer>
          <BgmManager />
          <Backgrounds />
          <div className='fixed inset-0'>
            <div className='w-full h-full overflow-y-auto relative'>
              <div className='w-full h-full flex flex-col'>
                <div className='flex flex-auto relative overflow-hidden'>
                  {children}
                </div>
                <MainMenu />
              </div>
            </div>
          </div>
        </DependenciesContainer>
      </body>
    </html>
  )
}
