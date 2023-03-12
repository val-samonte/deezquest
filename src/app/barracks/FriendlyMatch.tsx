import { Dialog } from '@/components/Dialog'
import { Tab } from '@headlessui/react'
import classNames from 'classnames'
import { QRCodeCanvas } from 'qrcode.react'
import { QrReader } from 'react-qr-reader'
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import SpinnerIcon from '@/components/SpinnerIcon'
import {
  messagesAtom,
  peerAtom,
  PeerMessage,
  peerNonceAtom,
} from '@/atoms/peerConnectionAtom'
import { burnerKeypairAtom } from '../BurnerAccountManager'
import { usePathname, useRouter } from 'next/navigation'
import { Keypair, PublicKey } from '@solana/web3.js'
import bs58 from 'bs58'
import { getNextHash } from '@/utils/getNextHash'
import { PeerMessages } from '@/enums/PeerMessages'
import { matchAtom } from '@/atoms/matchAtom'
import { combinePublicKeysAsHash } from '@/utils/combinePublicKeysAsHash'
import { MatchTypes } from '@/enums/MatchTypes'
import { sleep } from '@/utils/sleep'

interface FriendlyMatchProps {
  show: boolean
  onClose?: () => void
}

interface Parts {
  nftAddress: string | null
  burner: Keypair | null
  peerNonce: string | null
}

export default function FriendlyMatch({ show, onClose }: FriendlyMatchProps) {
  const router = useRouter()
  const pathname = usePathname()
  const nftAddress = useMemo(() => {
    if (!pathname) return null
    const parts = pathname.split('/')
    const address = parts[parts.length - 1]
    try {
      new PublicKey(address)
    } catch (e) {
      return null
    }

    return address
  }, [pathname])
  const burner = useAtomValue(burnerKeypairAtom)
  const peerNonce = useAtomValue(peerNonceAtom)
  const peerInstance = useAtomValue(peerAtom)
  const messages = useAtomValue(messagesAtom)
  const setMatch = useSetAtom(matchAtom)

  const lastMessage = useRef<PeerMessage | null>(null)
  useEffect(() => {
    if (!messages) return
    if (!peerInstance) return
    if (!burner || !peerNonce || !nftAddress) return

    if (messages[messages.length - 1] !== lastMessage.current) {
      const message = messages[messages.length - 1]
      lastMessage.current = message

      if (!message) return

      if (message.data.matchType === MatchTypes.FRIENDLY) {
        switch (message.data.type) {
          case PeerMessages.INVITATION:
            if (message.from !== message.data.publicKey) break

            const playerPublicKey = burner.publicKey.toBase58()

            const gameHash = combinePublicKeysAsHash(
              playerPublicKey,
              message.data.publicKey,
              true,
            ) as string

            const opponentPeerId = bs58.encode(
              getNextHash([
                new PublicKey(message.data.publicKey).toBytes(),
                Buffer.from(bs58.decode(message.data.peerNonce)),
              ]),
            )

            peerInstance
              .sendMessage(opponentPeerId, {
                type: PeerMessages.ACCEPT_INVITATION,
                matchType: MatchTypes.FRIENDLY,
              })
              .then(() => {
                setMatch({
                  matchType: MatchTypes.FRIENDLY,
                  gameHash,
                  ongoing: true,
                  opponent: {
                    publicKey: message.data.publicKey,
                    peerNonce: message.data.peerNonce,
                    nft: message.data.nftAddress,
                    peerId: opponentPeerId,
                  },
                  player: {
                    publicKey: playerPublicKey,
                    peerNonce,
                    nft: nftAddress,
                  },
                })
                router.push('/battle')
              })
            break
          case PeerMessages.ACCEPT_INVITATION:
            setMatch((match) => {
              if (!match) return null
              if (message.from !== match.opponent.publicKey) return match

              return {
                ...match,
                ongoing: true,
              }
            })
            router.push('/battle')
            break
        }
      }
    }
  }, [router, messages, peerInstance, burner, peerNonce, nftAddress])

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
            <AsHost
              burner={burner}
              nftAddress={nftAddress}
              peerNonce={peerNonce}
            />
          </Tab.Panel>
          <Tab.Panel className='flex flex-col'>
            <AsJoiner
              burner={burner}
              nftAddress={nftAddress}
              peerNonce={peerNonce}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </Dialog>
  )
}

function AsHost({ burner, nftAddress, peerNonce }: Parts) {
  const [matchCodeCopied, setMatchCodeCopied] = useState(false)
  const code = useMemo(() => {
    if (!nftAddress || !burner?.publicKey || !peerNonce) return null
    return [burner?.publicKey.toBase58(), peerNonce, nftAddress].join('.')
  }, [nftAddress, burner, peerNonce])

  if (!code) {
    return (
      <div className='mx-auto h-80 flex items-center justify-center'>
        <SpinnerIcon />
      </div>
    )
  }

  return (
    <>
      <div className='mx-auto mb-5 overflow-hidden rounded'>
        <QRCodeCanvas size={325} includeMargin value={code} />
      </div>
      <p className='mx-5 mb-5 text-center'>
        Share the code or let the other player scan the QR code. The game will
        start automatically once the other player is ready.
      </p>
      <button
        type='button'
        className='mx-5 px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded'
        onClick={() => {
          navigator.clipboard.writeText(code)
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

function AsJoiner(props: Parts) {
  const [code, setCode] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [permissionState, setPermissionState] = useState('granted') // useState('')
  const [busy, setBusy] = useState(false)
  const peerInstance = useAtomValue(peerAtom)
  const setMatch = useSetAtom(matchAtom)

  // TODO: fix this. phantom is complaining,
  // even tho the scanner is working fine :/

  // useEffect(() => {
  //   if (permissionState !== '') return
  //   navigator.permissions
  //     .query({ name: 'camera' as PermissionName })
  //     .then((result) => {
  //       console.log(result)
  //       setPermissionState(result.state)
  //     })
  // }, [permissionState])

  // const requestAccess = useCallback(() => {
  //   navigator.mediaDevices
  //     .getUserMedia({ video: true })
  //     .catch((error) => {
  //       console.error('Failed to get camera access:', error)
  //     })
  //     .finally(() => {
  //       setPermissionState('')
  //     })
  // }, [])

  const verifyCode = useCallback(async () => {
    if (!peerInstance) return
    if (!props.burner || !props.nftAddress || !props.peerNonce) return

    setErrorMsg('')
    setBusy(true)
    try {
      // code should be in 3 parts
      const parts = code.split('.')
      if (parts.length !== 3) {
        throw new Error(
          'Code is invalid, please try again. ' + JSON.stringify(parts),
        )
      }

      // 1st part should be a valid PublicKey
      const opponentPubkey = new PublicKey(parts[0])

      // 3rd part should be a valid PublicKey (NFT)
      const nftAddress = new PublicKey(parts[2])

      // derive peer id using opponentPubkey and peerNonce
      const opponentPeerId = bs58.encode(
        getNextHash([
          opponentPubkey.toBytes(),
          Buffer.from(bs58.decode(parts[1])),
        ]),
      )

      const playerPublicKey = props.burner.publicKey.toBase58()

      await peerInstance.sendMessage(opponentPeerId, {
        type: PeerMessages.INVITATION,
        matchType: MatchTypes.FRIENDLY,
        publicKey: playerPublicKey,
        peerNonce: props.peerNonce,
        nftAddress: props.nftAddress,
      })

      // preset values to localstorage
      setMatch({
        matchType: MatchTypes.FRIENDLY,
        gameHash: combinePublicKeysAsHash(
          props.burner.publicKey.toBase58(),
          parts[0],
          true,
        ) as string,
        ongoing: false,
        opponent: {
          publicKey: parts[0],
          peerNonce: parts[1],
          nft: parts[2],
          peerId: opponentPeerId,
        },
        player: {
          publicKey: playerPublicKey,
          peerNonce: props.peerNonce,
          nft: props.nftAddress,
        },
      })
    } catch (e: any) {
      setErrorMsg(e.message ?? e + '')
      setBusy(false)
    }
  }, [code, peerInstance, props, setBusy, setErrorMsg])

  return (
    <>
      <div className='px-5 mb-5'>
        {permissionState === 'granted' ? (
          <QrReader
            videoContainerStyle={{ width: '100%' }}
            videoStyle={{ width: '100%' }}
            containerStyle={{ width: '100%' }}
            className='w-full aspect-square bg-black/20 overflow-hidden rounded'
            constraints={{ facingMode: 'environment' }}
            onResult={async (result, error) => {
              if (!!result) {
                setCode(result?.getText())
                setBusy(true)
                await sleep(100)
                verifyCode()
              }

              if (error?.message) {
                setErrorMsg(error.message)
              }
            }}
          />
        ) : (
          <button
            type='button'
            className='w-full aspect-square bg-black/20 overflow-hidden rounded flex items-center justify-center text-center'
            // onClick={() => requestAccess()}
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
        disabled={busy}
        className={classNames(
          busy && 'opacity-20',
          'mx-5 mb-5 px-3 py-2 rounded bg-black/20',
        )}
        placeholder='Enter match code'
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button
        type='button'
        disabled={busy}
        className={classNames(
          busy && 'opacity-20',
          'mx-5 px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded',
        )}
        onClick={() => verifyCode()}
      >
        {busy ? (
          <div className='flex items-center justify-center'>
            <SpinnerIcon />
            <span className='ml-2'>Please Wait</span>
          </div>
        ) : (
          'Submit'
        )}
      </button>
    </>
  )
}
