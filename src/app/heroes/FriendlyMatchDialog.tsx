import Dialog from '@/components/Dialog'
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
  peerKeypairAtom,
  PeerMessage,
  peerNonceAtom,
} from '@/atoms/peerConnectionAtom'
import { useRouter } from 'next/navigation'
import { Keypair, PublicKey } from '@solana/web3.js'
import bs58 from 'bs58'
import { hashv } from '@/utils/hashv'
import { PeerMessages } from '@/enums/PeerMessages'
import { Match, matchAtom } from '@/atoms/matchAtom'
import { combinePublicKeysAsHash } from '@/utils/combinePublicKeysAsHash'
import { MatchTypes } from '@/enums/MatchTypes'
import Button from '@/components/Button'
import { selectedNftAtom } from '@/atoms/barracksAtoms'

interface FriendlyMatchProps {
  show: boolean
  onClose?: () => void
}

interface Parts {
  nftAddress: string | null
  keypair: Keypair | null
  peerNonce: string | null
}

export default function FriendlyMatchDialog({
  show,
  onClose,
}: FriendlyMatchProps) {
  const router = useRouter()
  const nft = useAtomValue(selectedNftAtom)
  const nftAddress = nft?.address ?? null
  const keypair = useAtomValue(peerKeypairAtom)
  const peerNonce = useAtomValue(peerNonceAtom)
  const peerInstance = useAtomValue(peerAtom)
  const messages = useAtomValue(messagesAtom)
  const setMatch = useSetAtom(matchAtom)

  const lastMessage = useRef<PeerMessage | null>(null)
  useEffect(() => {
    if (!messages) return
    if (!peerInstance) return
    if (!keypair || !peerNonce || !nftAddress) return

    if (messages[messages.length - 1] !== lastMessage.current) {
      const message = messages[messages.length - 1]
      lastMessage.current = message

      if (!message) return

      if (message.data.matchType === MatchTypes.FRIENDLY) {
        switch (message.data.type) {
          case PeerMessages.INVITATION:
            if (message.from !== message.data.publicKey) break

            const playerPublicKey = keypair.publicKey.toBase58()

            const gameHash = combinePublicKeysAsHash(
              playerPublicKey,
              message.data.publicKey,
              true,
            ) as string

            const opponentPeerId = bs58.encode(
              hashv([
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
              if (message.from !== (match as Match).opponent.publicKey)
                return match

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
  }, [router, messages, peerInstance, keypair, peerNonce, nftAddress, setMatch])

  return (
    <Dialog
      title='Friendly Match'
      show={show}
      onClose={onClose}
      className='max-w-sm bg-black/50'
    >
      <Tab.Group>
        <Tab.List className='px-2 pt-2 grid grid-cols-2 gap-2'>
          <Tab as={Fragment}>
            {({ selected }) => (
              <button
                className={classNames(
                  !selected
                    ? 'text-stone-500 hover:text-white hover:border-amber-400/25 border-transparent'
                    : 'text-white border-amber-400/50',
                  'relative px-3 py-2 flex items-center justify-center border-b',
                  'transition-all text-sm uppercase tracking-widest',
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
                    ? 'text-stone-500 hover:text-white hover:border-amber-400/25 border-transparent'
                    : 'text-white border-amber-400/50',
                  'relative px-3 py-2 flex items-center justify-center border-b',
                  'transition-all text-sm uppercase tracking-widest',
                )}
              >
                Join
              </button>
            )}
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel className='flex flex-col pb-5'>
            <AsHost
              keypair={keypair}
              nftAddress={nftAddress}
              peerNonce={peerNonce}
            />
          </Tab.Panel>
          <Tab.Panel className='flex flex-col pb-5'>
            <AsJoiner
              keypair={keypair}
              nftAddress={nftAddress}
              peerNonce={peerNonce}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </Dialog>
  )
}

function AsHost({ keypair, nftAddress, peerNonce }: Parts) {
  const [matchCodeCopied, setMatchCodeCopied] = useState(false)
  const code = useMemo(() => {
    console.log(nftAddress, keypair, peerNonce)
    if (!nftAddress || !keypair?.publicKey || !peerNonce) return null
    return [keypair?.publicKey.toBase58(), peerNonce, nftAddress].join('.')
  }, [nftAddress, keypair, peerNonce])

  if (!code) {
    return (
      <div className='mx-auto h-80 flex items-center justify-center'>
        <SpinnerIcon />
      </div>
    )
  }

  return (
    <>
      <div className='mx-auto my-5 overflow-hidden rounded'>
        <QRCodeCanvas size={325} includeMargin value={code} />
      </div>
      <p className='mx-5 mb-5 text-center text-sm'>
        Share the code or let the other player scan the QR code. The game will
        start automatically once the other player is ready.
      </p>
      <Button
        onClick={() => {
          navigator.clipboard.writeText(code)
          setMatchCodeCopied(true)
        }}
        onMouseOut={() => {
          setMatchCodeCopied(false)
        }}
        className={classNames('mx-5')}
      >
        {matchCodeCopied ? 'Copied to Clipboard!' : 'Copy Match Code'}
      </Button>
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

  const verifyCode = useCallback(
    async (paramCode?: string) => {
      if (!peerInstance) return
      if (!props.keypair || !props.nftAddress || !props.peerNonce) return

      const subjectCode = paramCode || code

      setErrorMsg('')
      setBusy(true)
      try {
        // code should be in 3 parts
        const parts = subjectCode.split('.')
        if (parts.length !== 3) {
          throw new Error('Code is invalid, please try again.')
        }

        // 1st part should be a valid PublicKey
        const opponentPubkey = new PublicKey(parts[0])

        if (opponentPubkey.equals(props.keypair.publicKey)) {
          throw Error('You cannot play against yourself!')
        }

        // 3rd part should be a valid PublicKey (NFT)
        const nftAddress = new PublicKey(parts[2])

        // derive peer id using opponentPubkey and peerNonce
        const opponentPeerId = bs58.encode(
          hashv([opponentPubkey.toBytes(), Buffer.from(bs58.decode(parts[1]))]),
        )

        const playerPublicKey = props.keypair.publicKey.toBase58()

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
            props.keypair.publicKey.toBase58(),
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
    },
    [code, peerInstance, props, setBusy, setErrorMsg, setMatch],
  )

  return (
    <>
      <div className='p-5 relative'>
        {permissionState === 'granted' ? (
          <QrReader
            videoContainerStyle={{ width: '100%' }}
            videoStyle={{ width: '100%' }}
            containerStyle={{ width: '100%' }}
            className='w-full aspect-square bg-black/20 overflow-hidden rounded'
            constraints={{ facingMode: 'environment' }}
            onResult={async (result, error) => {
              if (!!result) {
                const code = result?.getText()
                setCode(code)
                verifyCode(code)
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
        {errorMsg && (
          <p className='text-center absolute bottom-0 inset-x-0 mx-5 mb-5 text-red-400 bg-red-800/10 py-2 px-5 text-sm'>
            {errorMsg}
          </p>
        )}
      </div>

      <p className='text-sm mx-5 mb-5 text-center'>
        Scan the QR code or paste the code in the input box below, the match
        will begin automatically.
      </p>
      <input
        type='text'
        disabled={busy}
        className={classNames(
          busy && 'opacity-20',
          'text-center',
          'mx-5 mb-5 px-3 py-2 bg-amber-400/10',
        )}
        placeholder='Enter match code'
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <Button
        type='button'
        disabled={busy}
        className={classNames('mx-5', busy && 'opacity-20')}
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
      </Button>
    </>
  )
}
