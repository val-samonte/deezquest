import { barracksPathFlagsAtom } from '@/atoms/barracksAtoms'
import { Transition } from '@headlessui/react'
import classNames from 'classnames'
import { useAtomValue } from 'jotai'
import { IM_Fell_DW_Pica } from 'next/font/google'
import Image from 'next/image'

const font = IM_Fell_DW_Pica({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

const mask =
  'linear-gradient(105deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 70%)'

export default function Mission() {
  const { mission } = useAtomValue(barracksPathFlagsAtom)

  return (
    <Transition
      show={mission}
      className={classNames(
        'pointer-events-auto',
        'absolute inset-0',
        'flex flex-auto py-5 items-center justify-center',
      )}
    >
      <Transition.Child
        enter='ease-out duration-300'
        enterFrom='opacity-0 translate-y-10'
        enterTo='opacity-100 translate-y-0'
        leave='ease-out duration-200 delay-100'
        leaveFrom='opacity-100 translate-y-0'
        leaveTo='opacity-0 translate-y-10'
        className={classNames(
          'pointer-events-none select-none',
          'absolute inset-x-0 top-0 bottom-4 md:bottom-0',
        )}
      >
        <Image
          alt='mission'
          fill={true}
          src={`${process.env.NEXT_PUBLIC_CDN}/bg_map_alpha.png`}
          className={classNames('object-cover object-top md:object-left-top ')}
        />
      </Transition.Child>
      <div
        className={classNames(
          'relative w-[80%] aspect-[2/1]',
          'grid grid-cols-6 grid-rows-4',
          'text-xl text-amber-950',
          font.className,
        )}
      >
        <Transition.Child
          enter='ease-out duration-300 delay-100'
          enterFrom='opacity-0 scale-110'
          enterTo='opacity-100 scale-100'
          leave='ease-out duration-200'
          leaveFrom='opacity-100 scale-100'
          leaveTo='opacity-0 scale-90'
          className={classNames(
            'flex flex-col items-center justify-center gap-5',
            'relative col-span-3 row-span-4',
          )}
        >
          <div className='w-full aspect-[2/1] relative'>
            <Image
              alt='colosseum'
              src={`${process.env.NEXT_PUBLIC_CDN}/iso_colosseum_sketch.png`}
              fill={true}
              className='object-contain'
            />
          </div>
          <div className='max-w-sm mx-auto'>
            <h2 className={classNames('text-4xl')}>Ranked Match</h2>
            <p className={classNames('text-xl')}>
              Challenge other players on-chain and earn DeezCoins whenever you
              win the match (Coming Soon).
            </p>
          </div>
        </Transition.Child>
        <Transition.Child
          enter='ease-out duration-300 delay-300'
          enterFrom='opacity-0 scale-110'
          enterTo='opacity-100 scale-100'
          leave='ease-out duration-200'
          leaveFrom='opacity-100 scale-100'
          leaveTo='opacity-0 scale-90'
          className={classNames(
            'mission-item cursor-pointer hover:scale-105 transition-all',
            'flex flex-row-reverse items-center gap-5',
            'relative col-span-3 row-span-2 col-start-4',
          )}
        >
          <div
            className={classNames(
              'absolute -inset-x-5 w-full py-5 pl-5 pr-[50%] flex justify-end ',
            )}
          >
            <div
              className={classNames(
                'ribbon absolute inset-0',
                'bg-gradient-to-r from-black/0 via-black to-black/0 w-full',
                'border-y-2 border-amber-400/50 shadow-lg',
              )}
            />
            <div className='relative'>
              <h2 className={classNames('text-4xl')}>Practice</h2>
              <p className={classNames('text-xl whitespace-nowrap')}>
                Play against NPCs.
              </p>
            </div>
          </div>
          <div className='h-full aspect-square relative'>
            <Image
              alt='plains'
              src={`${process.env.NEXT_PUBLIC_CDN}/iso_plains.png`}
              fill={true}
              className='m-shadow object-contain brightness-0 blur-sm transition-all duration-300'
            />
            <Image
              alt='plains'
              src={`${process.env.NEXT_PUBLIC_CDN}/iso_plains_sketch.png`}
              fill={true}
              className='object-contain'
            />
            <Image
              alt='plains'
              src={`${process.env.NEXT_PUBLIC_CDN}/iso_plains.png`}
              fill={true}
              className='actual object-contain'
            />
          </div>
        </Transition.Child>
        <Transition.Child
          enter='ease-out duration-300 delay-500'
          enterFrom='opacity-0 scale-110'
          enterTo='opacity-100 scale-100'
          leave='ease-out duration-200'
          leaveFrom='opacity-100 scale-100'
          leaveTo='opacity-0 scale-90'
          className={classNames(
            'mission-item cursor-pointer hover:scale-105 transition-all',
            'flex items-center gap-5',
            'relative col-span-3 row-span-2 col-start-4',
          )}
        >
          <div
            className={classNames(
              'absolute -inset-x-5 w-full py-5 pr-5 pl-[60%]',
            )}
          >
            <div
              className={classNames(
                'ribbon absolute inset-0',
                'bg-gradient-to-r from-black/0 via-black to-black/0 w-full',
                'border-y-2 border-amber-400/50 shadow-lg',
              )}
            />
            <h2 className={classNames('relative text-4xl')}>Friendly</h2>
            <p className={classNames('relative text-xl whitespace-nowrap')}>
              Play against friends.
            </p>
          </div>
          <div className='h-full aspect-square relative'>
            <Image
              alt='arena'
              src={`${process.env.NEXT_PUBLIC_CDN}/iso_arena.png`}
              fill={true}
              className='m-shadow object-contain brightness-0 blur-sm transition-all duration-300'
            />
            <Image
              alt='arena'
              src={`${process.env.NEXT_PUBLIC_CDN}/iso_arena_sketch.png`}
              fill={true}
              className='object-contain'
            />
            <Image
              alt='arena'
              src={`${process.env.NEXT_PUBLIC_CDN}/iso_arena.png`}
              fill={true}
              className='actual object-contain'
            />
          </div>
        </Transition.Child>
      </div>
    </Transition>
  )
}

// <Transition
//       show={mission}
//       className={classNames(
//         'pointer-events-auto',
//         'absolute inset-0',
//         'flex flex-auto py-5 items-center justify-center',
//       )}
//     >
//       <Transition.Child
//         enter='ease-out duration-300 delay-100'
//         enterFrom='opacity-0 translate-y-10'
//         enterTo='opacity-100 translate-y-0'
//         leave='ease-out duration-200'
//         leaveFrom='opacity-100 translate-y-0'
//         leaveTo='opacity-0 translate-y-10'
//         className={classNames('absolute inset-x-0 top-0 bottom-4 md:bottom-0')}
//       >
//         <Image
//           alt='mission'
//           fill={true}
//           src={`${process.env.NEXT_PUBLIC_CDN}/bg_map_alpha.png`}
//           className={classNames(
//             'object-cover brightness-50 object-top md:object-left-top ',
//           )}
//         />
//       </Transition.Child>

//       <div
//         className={classNames(
//           'pointer-events-none',
//           '2xl:portrait:h-full 2xl:landscape:w-full',
//           '2xl:portrait:max-h-[80vw] 2xl:landscape:max-w-[75vh] 2xl:aspect-square',
//           'landscape:md:w-[70%] landscape:md:aspect-[3/1]',
//           'grid landscape:gap-[2vh] portrait:gap-[2vw]',
//           '2xl:-rotate-45 2xl:grid-rows-5 2xl:grid-cols-1',
//           'landscape:md:grid-cols-5',
//         )}
//       >
//         <div
//           className={classNames('2xl:row-span-3', 'landscape:md:col-span-3')}
//         >
//           <Transition.Child
//             enter='ease-out duration-300 delay-300'
//             enterFrom='opacity-0 scale-110'
//             enterTo='opacity-100 scale-100'
//             leave='ease-out duration-200'
//             leaveFrom='opacity-100'
//             leaveTo='opacity-0'
//             className={classNames(
//               '2xl:border-l 2xl:border-t 2xl:border-amber-400/50',
//               'h-full aspect-square relative flex items-center justify-center',
//             )}
//           >
//             <div
//               className={classNames(
//                 'absolute inset-1 overflow-hidden sepia contrast-125 opacity-80 brightness-50',
//                 'landscape:md:-rotate-45 2xl:rotate-0',
//                 'border-l border-t border-amber-400/50',
//                 'landscape:md:scale-75',
//                 // 'landscape:md:border-l landscape:md:border-t landscape:md:border-amber-400/50',
//               )}
//               style={{
//                 WebkitMaskImage: mask,
//                 maskImage: mask,
//               }}
//             >
//               <Image
//                 fill={true}
//                 alt='Ranked Match'
//                 src={`${process.env.NEXT_PUBLIC_CDN}/bg_arena.png`}
//                 className='object-cover rotate-45 scale-150'
//               />
//             </div>
//             <div
//               className={classNames(
//                 'h-[50%] aspect-square absolute -top-1 -left-1 border-t-4 border-l-4 border-amber-400/50',
//                 'landscape:md:-rotate-45 2xl:rotate-0',
//               )}
//             >
//               <Image
//                 alt='Ranked Match'
//                 src={`/BattleIcon.svg`}
//                 fill={true}
//                 className='object-fit 2xl:rotate-45 scale-50'
//               />
//             </div>
//             <div className='relative 2xl:rotate-45'>
//               <div className='absolute flex flex-col w-96 -translate-y-[50%] -translate-x-20'>
//                 <h2 className={classNames('text-5xl', font.className)}>
//                   Ranked Game
//                 </h2>
//                 <div className='h-1 max-w-xs w-full my-2 bg-gradient-to-r from-amber-400/50 to-amber-400/0' />
//                 <p className='text-neutral-300 mb-2 max-w-xs'>
// Challenge other players on-chain and earn DeezCoins whenever
// you win the match.
//                 </p>
//                 <p className='text-neutral-300 italic'>Coming Soon</p>
//               </div>
//             </div>
//           </Transition.Child>
//         </div>
//         <div
//           className={classNames(
//             'grid landscape:gap-[2vh] portrait:gap-[2vw]',
//             '2xl:row-span-2 2xl:grid-cols-3',
//             'landscape:md:col-span-2 landscape:md:grid-cols-1 landscape:md:grid-rows-2',
//           )}
//         >
//           <div className='h-full hidden 2xl:block' />
//           <div className='h-full'>
//             <Transition.Child
//               enter='ease-out duration-300 delay-500'
//               enterFrom='opacity-0 scale-110'
//               enterTo='opacity-100 scale-100'
//               leave='ease-out duration-200'
//               leaveFrom='opacity-100'
//               leaveTo='opacity-0'
//               className={classNames(
//                 'transition-all duration-300 hover:scale-110 cursor-pointer',
//                 'border-l border-t border-amber-400/50',
//                 'w-full aspect-square relative flex items-center justify-center',
//               )}
//             >
//               <div
//                 className={classNames(
//                   'transition-all duration-300 pointer-events-auto',
//                   'absolute inset-1 overflow-hidden sepia contrast-125 opacity-80 brightness-50',
//                   'hover:sepia-0 hover:brightness-100',
//                 )}
//                 style={{
//                   WebkitMaskImage: mask,
//                   maskImage: mask,
//                 }}
//               >
//                 <Image
//                   fill={true}
//                   alt='Friendly Match'
//                   src={`${process.env.NEXT_PUBLIC_CDN}/bg_ruins.png`}
//                   className='object-cover 2xl:rotate-45 scale-150 '
//                 />
//               </div>
//               <div className='h-[50%] aspect-square absolute -top-1 -left-1 border-l-4 border-t-4 border-amber-400/50'>
//                 <Image
//                   alt='Friendly Match'
//                   src={`/match_practice.svg`}
//                   fill={true}
//                   className='object-fit 2xl:rotate-45 scale-50'
//                 />
//               </div>
//               <div className='relative 2xl:rotate-45'>
//                 <div className='absolute flex flex-col w-52 -translate-y-[50%] -translate-x-10'>
//                   <h2 className={classNames('text-4xl', font.className)}>
//                     Friendly
//                   </h2>
//                   <div className='h-1 w-full my-1 bg-gradient-to-r from-amber-400/50 to-amber-400/0' />
//                   <p className='text-neutral-300 mb-2'>
//                     Play against your friend.
//                   </p>
//                 </div>
//               </div>
//             </Transition.Child>
//           </div>
//           <div className='h-full'>
//             <Transition.Child
//               enter='ease-out duration-300 delay-700'
//               enterFrom='opacity-0 scale-110'
//               enterTo='opacity-100 scale-100'
//               leave='ease-out duration-200'
//               leaveFrom='opacity-100'
//               leaveTo='opacity-0'
//               className={classNames(
//                 'transition-all duration-300 hover:scale-110 cursor-pointer',
//                 'border-l border-t border-amber-400/50',
//                 'w-full aspect-square relative flex items-center justify-center',
//               )}
//             >
//               <div
//                 className={classNames(
//                   'transition-all duration-300 pointer-events-auto',
//                   'absolute inset-1 overflow-hidden sepia contrast-125 opacity-80 brightness-50',
//                   'hover:sepia-0 hover:brightness-100',
//                 )}
//                 style={{
//                   WebkitMaskImage: mask,
//                   maskImage: mask,
//                 }}
//               >
//                 <Image
//                   fill={true}
//                   alt='Bot Match'
//                   src={`${process.env.NEXT_PUBLIC_CDN}/bg_mission.png`}
//                   className='object-cover 2xl:rotate-45 scale-150 '
//                 />
//               </div>
//               <div className='h-[50%] aspect-square absolute -top-1 -left-1 border-l-4 border-t-4 border-amber-400/50'>
//                 <Image
//                   alt='Bot Match'
//                   src={`/match_bot.svg`}
//                   fill={true}
//                   className='object-fit 2xl:rotate-45 scale-50'
//                 />
//               </div>
//               <div className='relative 2xl:rotate-45'>
//                 <div className='absolute flex flex-col w-52 -translate-y-[50%] -translate-x-10'>
//                   <h2 className={classNames('text-4xl', font.className)}>
//                     Pratice
//                   </h2>
//                   <div className='h-1 w-full my-1 bg-gradient-to-r from-amber-400/50 to-amber-400/0' />
//                   <p className='text-neutral-300 mb-2'>
//                     Play against a bot off-chain.
//                   </p>
//                 </div>
//               </div>
//             </Transition.Child>
//           </div>
//         </div>
//       </div>
//     </Transition>
