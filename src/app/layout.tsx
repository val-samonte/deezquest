import DependenciesContainer from './DependenciesContainer'
import '@solana/wallet-adapter-react-ui/styles.css'
import './globals.css'

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
        <div className='fixed inset-0'>
          <div className='w-full h-full overflow-y-auto'>
            <DependenciesContainer>{children}</DependenciesContainer>
          </div>
        </div>
      </body>
    </html>
  )
}
