import { Dialog } from '@/components/Dialog'
import { useSearchParams } from 'next/navigation'
import { QRCodeCanvas } from 'qrcode.react'
import { useState } from 'react'

interface FriendlyMatchProps {
  show: boolean
  onClose?: () => void
}

export default function FriendlyMatch({ show, onClose }: FriendlyMatchProps) {
  const searchParams = useSearchParams()
  const opponent = searchParams?.get('opponent') ?? null

  return (
    <Dialog
      title='Friendly Match'
      show={show}
      onClose={onClose}
      className='max-w-sm'
    >
      <>a</>
    </Dialog>
  )
}

function AsHost() {
  const [matchLinkCopied, setMatchLinkCopied] = useState(false)
  return (
    <>
      <p className='mx-5 mb-5'>
        Click <span className='font-bold'>Copy Match Link</span> and share it
        with someone you would like to play with, or let&apos;em scan this QR
        code.
      </p>
      {/* <QRCodeCanvas
              className='mx-auto mb-5'
              size={200}
              includeMargin
              value={`${
                window.location.origin
              }/demo?opponent=${kp.publicKey.toBase58()}`}
            /> */}
      <p className='mx-5 mb-5'>
        If the link has already been shared, please standby and wait for the
        other player to set up. The game will commence automatically.
      </p>
      <div className='flex-auto'></div>
      <button
        type='button'
        className='mx-5 px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded'
        // onClick={() => {
        //   navigator.clipboard.writeText(
        //     `${
        //       window.location.origin
        //     }/demo?opponent=${kp.publicKey.toBase58()}`,
        //   )
        //   setMatchLinkCopied(true)
        // }}
      >
        {/* {matchLinkCopied ? 'Copied to Clipboard!' : 'Copy Match Link'} */}
      </button>
    </>
  )
}

// <Dialog
//         show={startMatch}
//         title='DEMO Match'
//         className='max-w-sm'
//         onClose={() => setStartMatch(false)}
//       >
//         {!opponent ? (
//           <>
//             <p className='mx-5 mb-5'>
//               Click <span className='font-bold'>Copy Match Link</span> and share
//               it with someone you would like to play with, or let&apos;em scan
//               this QR code.
//             </p>
//             <QRCodeCanvas
//               className='mx-auto mb-5'
//               size={200}
//               includeMargin
//               value={`${
//                 window.location.origin
//               }/demo?opponent=${kp.publicKey.toBase58()}`}
//             />
//             <p className='mx-5 mb-5'>
//               If the link has already been shared, please standby and wait for
//               the other player to set up. The game will commence automatically.
//             </p>

//             <div className='flex-auto'></div>
//             <button
//               type='button'
//               className='mx-5 px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded'
//               onClick={() => {
//                 navigator.clipboard.writeText(
//                   `${
//                     window.location.origin
//                   }/demo?opponent=${kp.publicKey.toBase58()}`,
//                 )
//                 setMatchLinkCopied(true)
//               }}
//             >
//               {matchLinkCopied ? 'Copied to Clipboard!' : 'Copy Match Link'}
//             </button>
//           </>
//         ) : (
//           <>
//             <p className='mx-5 mb-5'>
//               You are about to start your match with{' '}
//               <span className='font-bold'>{trimAddress(opponent)}</span>.
//             </p>
//             <p className='mx-5 mb-5'>
//               If you would like to play with different opponent,{' '}
//               <button
//                 type='button'
//                 className='underline'
//                 onClick={() => {
//                   clearMessages(opponent)
//                   setMessageCursor(0)
//                   localStorage.removeItem('demo_opponent')
//                   setOpponent('')
//                 }}
//               >
//                 click here
//               </button>
//               .
//             </p>
//             {errorMsg && (
//               <p className='mx-5 mb-5 text-red-400 bg-red-800/10 p-5 text-sm rounded'>
//                 {errorMsg}
//               </p>
//             )}
//             <div className='flex-auto'></div>
//             <button
//               type='button'
//               className='mx-5 px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded'
//               onClick={() => {
//                 sendMessage(opponent, { type: PeerMessages.INVITATION }).catch(
//                   () =>
//                     setErrorMsg(
//                       'Opponent is not available. Ask for the match link again.',
//                     ),
//                 )
//               }}
//             >
//               Start Match
//             </button>
//           </>
//         )}
//       </Dialog>
