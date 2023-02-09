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
      <body className='w-screen h-screen bg-neutral-900 text-neutral-200'>
        <DependenciesContainer>{children}</DependenciesContainer>
      </body>
    </html>
  )
}
