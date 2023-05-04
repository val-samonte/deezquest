'use client'

import { useUserWallet } from '@/atoms/userWalletAtom'
import { trimAddress } from '@/utils/trimAddress'
import classNames from 'classnames'
import { atom, useAtom } from 'jotai'
import { ReactNode, useEffect, useState } from 'react'

interface PlayerStatus {
  score?: number
  energy?: number
}

const statusDefault = {
  score: undefined,
  energy: undefined,
}

export const playerStatusAtom = atom<PlayerStatus>(statusDefault)

interface SpecialEventDisplayProps {
  children: ReactNode
}

export default function SpecialEventDisplay({
  children,
}: SpecialEventDisplayProps) {
  const wallet = useUserWallet()
  const [leaderboard, setLeaderboard] = useState<
    { score: number; owner: string; date: number }[]
  >([])
  const [status, setStatus] = useAtom(playerStatusAtom)
  const publicKey = wallet?.publicKey

  useEffect(() => {
    setLeaderboard([])
    fetch('/api/centralized_match/leaderboard')
      .then((resp) => resp.json())
      .then((top) => setLeaderboard(top ?? []))
  }, [setLeaderboard])

  useEffect(() => {
    setStatus(statusDefault)
    if (!publicKey) return
    fetch(`/api/centralized_match/status?publicKey=${publicKey.toBase58()}`)
      .then((resp) => resp.json())
      .then((status) => setStatus(status))
  }, [publicKey, setStatus])

  return (
    <div className='flex gap-10 portrait:flex-col w-full'>
      <div className='flex flex-col gap-5 flex-none landscape:max-w-min'>
        <div className='bg-black/50 w-60 h-60 mx-auto portrait:h-auto aspect-square relative overflow-hidden'>
          {children}
        </div>

        <div className='flex flex-col gap-5'>
          <p className='grid grid-cols-3'>
            <span className='col-span-2'>Your Score</span>
            <span className='text-right font-mono font-bold flex items-center justify-end'>
              {status.score ?? (
                <span className='block bg-neutral-400 rounded h-4 w-16 animate-pulse'></span>
              )}
            </span>
            <span className='col-span-2'>
              Energy{' '}
              <span className='text-neutral-400 italic text-xs'>
                (Refreshes daily)
              </span>
            </span>
            <span className='text-right font-bold flex items-center justify-end'>
              ⚡
              {status.energy ?? (
                <span className='block bg-neutral-400 rounded h-4 w-8 animate-pulse'></span>
              )}
            </span>
          </p>
          <p className='text-white'>
            Some <span className='text-purple-500 font-bold'>Dark BUNNiEZ</span>{' '}
            have been pestering the Rabbit Hole and delivering chaos. Defeat
            them, and the chief will reward you mfers. Hophop!
          </p>
          <ul className='flex flex-col gap-2'>
            <li>
              <a
                href='https://twitter.com/bunniezsol'
                className='flex items-center gap-2 font-bold'
                rel='noopener noreferrer'
              >
                <img src='/twitter.svg' className='h-4 w-4' />
                BUNNiEZ Twitter
              </a>
            </li>
            <li>
              <a
                href='https://discord.gg/bunniez'
                className='flex items-center gap-2 font-bold'
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
            <li className='w-full h-10 grid grid-cols-8 px-5 items-center gap-5 uppercase text-sm text-neutral-400'>
              <div className='col-span-2'>Rank</div>
              <div className='col-span-4'>Address</div>
              <div className='col-span-2 text-right'>Score</div>
            </li>

            {Array.from(new Array(10)).map((_, i) => (
              <li
                key={`top_${i}`}
                className={classNames(
                  i % 2 === 0 ? 'bg-black/60' : 'bg-black/50',
                  !leaderboard?.[i] && 'text-neutral-400',
                  'w-full  h-10 grid grid-cols-8 px-5 items-center gap-5',
                )}
              >
                <div className='col-span-2 font-mono font-bold'>{i + 1}</div>
                <div className='col-span-4'>
                  {leaderboard?.[i] ? (
                    <span>
                      {trimAddress(leaderboard?.[i].owner)}{' '}
                      {leaderboard?.[i].owner === publicKey?.toBase58() && (
                        <span className='font-mono font-bold'>(You)</span>
                      )}
                    </span>
                  ) : (
                    <span>Vacant</span>
                  )}
                </div>
                <div className='col-span-2 text-right'>
                  {leaderboard?.[i] ? (
                    <span className='font-mono font-bold'>
                      {leaderboard?.[i].score}
                    </span>
                  ) : (
                    <span>--</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
