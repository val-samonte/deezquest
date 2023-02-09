import Stage from './Stage'

export default function Battle() {
  return (
    <main className='flex flex-col landscape:justify-center w-full h-full'>
      <div className='max-w-[100vw] max-h-[100vh] landscape:w-full landscape:aspect-[5/3] portrait:h-full portrait:aspect-[3/5] mx-auto'>
        <Stage />
      </div>
    </main>
  )
}
