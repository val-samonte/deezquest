import DependenciesContainer from './DependenciesContainer'
import dynamic from 'next/dynamic'
import Backgrounds from './Backgrounds'
import BurnerAccountManager from './BurnerAccountManager'
import '@solana/wallet-adapter-react-ui/styles.css'
import './globals.css'
// import PeerConnectionManager from './PeerConnectionManager'

const MainMenu = dynamic(() => import('./MainMenu'), { ssr: false })
const PeerConnectionManager = dynamic(() => import('./PeerConnectionManager'), {
  ssr: false,
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body className='bg-black text-neutral-200'>
        <DependenciesContainer>
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
          <PeerConnectionManager />
          <BurnerAccountManager />
        </DependenciesContainer>
      </body>
    </html>
  )
}
