import { trimAddress } from '@/utils/trimAddress'
import { ReactNode } from 'react'

interface SpecialEventDisplayProps {
  children: ReactNode
}

export default function SpecialEventDisplay({
  children,
}: SpecialEventDisplayProps) {
  return (
    <div className='flex gap-10 portrait:flex-col w-full'>
      <div className='flex flex-col gap-5 flex-none landscape:max-w-min'>
        <div className='bg-black/20 w-60 h-60 mx-auto portrait:h-auto aspect-square relative overflow-hidden'>
          {children}
        </div>

        <div className='flex flex-col gap-5'>
          <p>
            Suscipit dolore ducimus sapiente ut consequuntur expedita iste
            dolores eligendi? Animi nobis veniam fugit sunt.
          </p>
          <ul className='flex flex-col gap-2'>
            <li>
              <a
                href='https://twitter.com/bunniezsol'
                className='flex items-center gap-1 font-bold'
                rel='noopener noreferrer'
              >
                <img src='/twitter.svg' className='h-4 w-4' />
                BUNNiEZ Twitter
              </a>
            </li>
            <li>
              <a
                href='https://discord.gg/bunniez'
                className='flex items-center gap-1 font-bold'
                rel='noopener noreferrer'
              >
                <img src='/discord.svg' className='h-4 w-4' />
                BUNNiEZ Discord
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className='flex flex-auto flex-col gap-5 w-full'>
        <div className='flex flex-col'>
          <h2 className='text-xl font-bold mb-3'>Leaderboard</h2>
          <ul className='flex flex-col w-full'>
            <li className='w-full h-10 grid grid-cols-8 px-5 items-center gap-5 uppercase text-sm text-neutral-500'>
              <div className='col-span-2'>Rank</div>
              <div className='col-span-4'>Address</div>
              <div className='col-span-2 text-right'>Score</div>
            </li>
            <li className='w-full bg-neutral-800/50 h-10 grid grid-cols-8 px-5 items-center gap-5'>
              <div className='col-span-2'>1</div>
              <div className='col-span-4'>
                {trimAddress('53vUyd7iFntjgcwtmAZAhtyrWmssiRvs3AvWiUJfoXw5')}
              </div>
              <div className='col-span-2 text-right'>69</div>
            </li>
            <li className='w-full bg-neutral-800/20 h-10 grid grid-cols-8 px-5 items-center gap-5'>
              <div className='col-span-2'>2</div>
              <div className='col-span-4'>
                {trimAddress('53vUyd7iFntjgcwtmAZAhtyrWmssiRvs3AvWiUJfoXw5')}
              </div>
              <div className='col-span-2 text-right'>69</div>
            </li>
            <li className='w-full bg-neutral-800/50 h-10 grid grid-cols-8 px-5 items-center gap-5'>
              <div className='col-span-2'>3</div>
              <div className='col-span-4'>
                {trimAddress('53vUyd7iFntjgcwtmAZAhtyrWmssiRvs3AvWiUJfoXw5')}
              </div>
              <div className='col-span-2 text-right'>69</div>
            </li>
            <li className='w-full bg-neutral-800/20 h-10 grid grid-cols-8 px-5 items-center gap-5'>
              <div className='col-span-2'>4</div>
              <div className='col-span-4'>
                {trimAddress('53vUyd7iFntjgcwtmAZAhtyrWmssiRvs3AvWiUJfoXw5')}
              </div>
              <div className='col-span-2 text-right'>69</div>
            </li>
            <li className='w-full bg-neutral-800/50 h-10 grid grid-cols-8 px-5 items-center gap-5'>
              <div className='col-span-2'>5</div>
              <div className='col-span-4'>
                {trimAddress('53vUyd7iFntjgcwtmAZAhtyrWmssiRvs3AvWiUJfoXw5')}
              </div>
              <div className='col-span-2 text-right'>69</div>
            </li>
            <li className='w-full bg-neutral-800/20 h-10 grid grid-cols-8 px-5 items-center gap-5'>
              <div className='col-span-2'>6</div>
              <div className='col-span-4'>
                {trimAddress('53vUyd7iFntjgcwtmAZAhtyrWmssiRvs3AvWiUJfoXw5')}
              </div>
              <div className='col-span-2 text-right'>69</div>
            </li>
            <li className='w-full bg-neutral-800/50 h-10 grid grid-cols-8 px-5 items-center gap-5'>
              <div className='col-span-2'>7</div>
              <div className='col-span-4'>
                {trimAddress('53vUyd7iFntjgcwtmAZAhtyrWmssiRvs3AvWiUJfoXw5')}
              </div>
              <div className='col-span-2 text-right'>69</div>
            </li>
            <li className='w-full bg-neutral-800/20 h-10 grid grid-cols-8 px-5 items-center gap-5'>
              <div className='col-span-2'>8</div>
              <div className='col-span-4'>
                {trimAddress('53vUyd7iFntjgcwtmAZAhtyrWmssiRvs3AvWiUJfoXw5')}
              </div>
              <div className='col-span-2 text-right'>69</div>
            </li>
            <li className='w-full bg-neutral-800/50 h-10 grid grid-cols-8 px-5 items-center gap-5'>
              <div className='col-span-2'>9</div>
              <div className='col-span-4'>
                {trimAddress('53vUyd7iFntjgcwtmAZAhtyrWmssiRvs3AvWiUJfoXw5')}
              </div>
              <div className='col-span-2 text-right'>69</div>
            </li>
            <li className='w-full bg-neutral-800/20 h-10 grid grid-cols-8 px-5 items-center gap-5'>
              <div className='col-span-2'>10</div>
              <div className='col-span-4'>
                {trimAddress('53vUyd7iFntjgcwtmAZAhtyrWmssiRvs3AvWiUJfoXw5')}
              </div>
              <div className='col-span-2 text-right'>69</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
