'use client'

import { Dialog } from '@/components/Dialog'
import classNames from 'classnames'
import { atom, useAtom } from 'jotai'

const existingMatchBaseAtom = atom(false)

export const existingMatchAtom = atom(
  (get) => get(existingMatchBaseAtom),
  (_, set, callback: boolean) => {
    set(existingMatchBaseAtom, callback)
  },
)

export default function ExistingMatch() {
  const [show, setShow] = useAtom(existingMatchBaseAtom)
  return (
    <Dialog onClose={() => setShow(false)} show={show} className='max-w-sm'>
      <p className='text-center px-5 mb-5'>
        Would you like to continue your existing match?
      </p>
      <div className='flex-auto' />
      <div className='flex gap-3 px-5'>
        <button
          type='button'
          className={classNames(
            'px-3 py-2 bg-neutral-700 hover:bg-neutral-600 rounded flex items-center',
          )}
          onClick={() => {}}
        >
          Cancel
        </button>
        <button
          type='button'
          className={classNames(
            'flex items-center justify-center',
            'flex-auto px-3 py-2 bg-red-700 hover:bg-red-600 rounded',
          )}
          onClick={() => {
            // setQuitMatchConfirm(false)
            // if (
            //   match?.matchType === MatchTypes.FRIENDLY &&
            //   match?.opponent.peerId
            // ) {
            //   peerInstance?.sendMessage(match?.opponent.peerId, {
            //     type: PeerMessages.QUIT,
            //   })
            // }
            // window.sessionStorage.clear()
            // setGameState(null)
            // setMatch(null)
            // setGameResult('')
            // router.push('/barracks')
          }}
        >
          Quit Match
        </button>
      </div>
    </Dialog>
  )
}
