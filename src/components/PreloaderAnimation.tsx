import { Transition } from '@headlessui/react'

export default function PreloaderAnimation() {
  return (
    <Transition
      appear={true}
      show={true}
      enter='transition-opacity duration-500'
      enterFrom='opacity-0'
      enterTo='opacity-100'
      className='absolute inset-0 flex flex-col items-center justify-center backdrop-grayscale'
    >
      <div className='absolute inset-0 flex items-center justify-center animate-pulse'>
        <img
          src='/magic_circle.svg'
          className='landscape:max-h-sm portrait:max-w-sm landscape:h-[60vh] portrait:w-[60vw] aspect-square opacity-5 animate-spin-slow'
        />
      </div>
      <div className='landscape:max-h-sm portrait:max-w-sm landscape:h-[60vh] portrait:w-[60vw] aspect-square relative animate-spin-slow'>
        <img
          src='/sym_3.png'
          className='animate-anti-spin w-14 h-14 md:w-20 md:h-20 object-contain absolute top-0 left-0'
        />
        <img
          src='/sym_4.png'
          className='animate-anti-spin w-14 h-14 md:w-20 md:h-20 object-contain absolute top-0 right-0'
        />
        <img
          src='/sym_5.png'
          className='animate-anti-spin w-14 h-14 md:w-20 md:h-20 object-contain absolute bottom-0 left-0'
        />
        <img
          src='/sym_6.png'
          className='animate-anti-spin w-14 h-14 md:w-20 md:h-20 object-contain absolute bottom-0 right-0'
        />
      </div>
      <p className='text-center sm:text-lg xl:text-xl absolute inset-0 flex items-center justify-center'>
        Loading
      </p>
    </Transition>
  )
}
