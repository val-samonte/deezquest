import '@solana/wallet-adapter-react-ui/styles.css'
import './globals.css'

import { Metadata } from 'next'
import Backgrounds from './Backgrounds'
import BgmManager from './BgmManager'
import DependenciesContainer from './DependenciesContainer'
import MainMenu from './MainMenu'

export const metadata: Metadata = {
  title: 'DeezQuest | Puzzle RPG in Solana',
  description:
    'Play Match 3 with a twist of RPG in Solana! 100% decentralized and open source.',
  icons: {
    icon: '/favicon-32x32.png',
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  themeColor: 'black',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body className='bg-black text-neutral-200'>
        <DependenciesContainer>
          <BgmManager />
          <Backgrounds />
          <div className='fixed inset-0'>
            <div className='w-full h-full overflow-y-auto relative'>
              <div className='w-full h-full flex flex-col'>
                <div className='flex flex-auto relative overflow-hidden'>
                  {/* backpack close button clearance is 56px in height */}
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
