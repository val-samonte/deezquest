import { Dialog } from '@/components/Dialog'
import { Tab } from '@headlessui/react'
import classNames from 'classnames'
import { QRCodeCanvas } from 'qrcode.react'
import { QrReader } from 'react-qr-reader'
import { Fragment, useCallback, useEffect, useState } from 'react'
import { useAtomValue } from 'jotai'
import SpinnerIcon from '@/components/SpinnerIcon'
import { peerIdAtom } from '@/atoms/peerConnectionAtom'
import { ErrorBoundary } from '@/components/ErrorBoundary'

interface FriendlyMatchProps {
  show: boolean
  onClose?: () => void
}

export default function FriendlyMatch({ show, onClose }: FriendlyMatchProps) {
  // const searchParams = useSearchParams()
  // const opponent = searchParams?.get('opponent') ?? null

  return (
    <Dialog
      title='Friendly Match'
      show={show}
      onClose={onClose}
      className='max-w-sm'
    >
      <Tab.Group>
        <Tab.List className='px-2 grid grid-cols-2 gap-2 -mt-3 mb-5'>
          <Tab as={Fragment}>
            {({ selected }) => (
              <button
                className={classNames(
                  !selected
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-600 hover:text-neutral-500'
                    : 'bg-neutral-700 hover:bg-neutral-600',
                  'px-3 py-2 rounded flex items-center justify-center',
                )}
              >
                Host
              </button>
            )}
          </Tab>
          <Tab as={Fragment}>
            {({ selected }) => (
              <button
                className={classNames(
                  !selected
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-600 hover:text-neutral-500'
                    : 'bg-neutral-700 hover:bg-neutral-600',
                  'px-3 py-2 rounded flex items-center justify-center',
                )}
              >
                Join
              </button>
            )}
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel className='flex flex-col'>
            <AsHost />
          </Tab.Panel>
          <Tab.Panel className='flex flex-col'>
            <AsJoiner />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </Dialog>
  )
}

function AsHost() {
  const [matchCodeCopied, setMatchCodeCopied] = useState(false)
  const peerId = useAtomValue(peerIdAtom)

  if (!peerId) {
    return (
      <div className='mx-auto h-80 flex items-center justify-center'>
        <SpinnerIcon />
      </div>
    )
  }

  return (
    <>
      <div className='mx-auto mb-5 overflow-hidden rounded'>
        <QRCodeCanvas size={200} includeMargin value={peerId} />
      </div>
      <p className='mx-5 mb-5 text-center'>
        Share the code or let the other player scan the QR code. The game will
        start automatically once the other player is ready.
      </p>
      <button
        type='button'
        className='mx-5 px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded'
        onClick={() => {
          navigator.clipboard.writeText(peerId)
          setMatchCodeCopied(true)
        }}
        onMouseOut={() => {
          setMatchCodeCopied(false)
        }}
      >
        {matchCodeCopied ? 'Copied to Clipboard!' : 'Copy Match Code'}
      </button>
    </>
  )
}

function AsJoiner() {
  const [code, setCode] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [permissionState, setPermissionState] = useState('')

  useEffect(() => {
    if (permissionState !== '') return
    navigator.permissions
      .query({ name: 'camera' as PermissionName })
      .then((result) => {
        console.log(result)
        setPermissionState(result.state)
      })
  }, [permissionState])

  const requestAccess = useCallback(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .catch((error) => {
        console.error('Failed to get camera access:', error)
      })
      .finally(() => {
        setPermissionState('')
      })
  }, [])

  return (
    <>
      <div className='px-5 mb-5'>
        {permissionState === 'granted' ? (
          <ErrorBoundary
            fallback={({ error }) => (
              <div className='w-full aspect-square bg-black/20 overflow-hidden rounded flex items-center justify-center text-center'>
                Unable to open the camera {JSON.stringify(error)}
              </div>
            )}
          >
            <QrReader
              className='w-full aspect-square bg-black/20 overflow-hidden rounded'
              constraints={{ facingMode: 'environment' }}
              onResult={(result, error) => {
                if (!!result) {
                  setCode(result?.getText())
                }

                if (!!error) {
                  console.info(error)
                  setErrorMsg(error + '')
                }
              }}
            />
          </ErrorBoundary>
        ) : (
          <button
            type='button'
            className='w-full aspect-square bg-black/20 overflow-hidden rounded flex items-center justify-center text-center'
            onClick={() => requestAccess()}
          >
            Tap to enable camera
          </button>
        )}
      </div>
      {errorMsg && (
        <p className='mx-5 mb-5 text-red-400 bg-red-800/10 p-5 text-sm rounded'>
          {errorMsg}
        </p>
      )}
      <p className='mx-5 mb-5 text-center'>
        Scan the QR code or paste the code in the input box below, the match
        will begin automatically.
      </p>
      <input
        type='text'
        className='mx-5 mb-5 px-3 py-2 rounded bg-black/20'
        placeholder='Enter match code'
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button
        type='button'
        className='mx-5 px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded'
        onClick={() => {}}
      >
        Submit
      </button>
    </>
  )
}
