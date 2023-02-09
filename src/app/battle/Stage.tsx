'use client'

export default function Stage() {
  return (
    <div className='w-full h-full flex portrait:flex-col'>
      <div className='flex-auto'></div>
      <div className='landscape:h-full portrait:w-full aspect-square bg-black flex-none'></div>
      <div className='flex-auto'></div>
    </div>
  )
}
