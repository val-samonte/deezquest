'use client'

import Peer, { DataConnection } from 'peerjs'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Keypair } from '@solana/web3.js'
import { sign } from 'tweetnacl'
import bs58 from 'bs58'
import classNames from 'classnames'
import {
  connectionListAtom,
  messagesAtom,
  peerListAtom,
  PeerMessage,
  peerOpenAtom,
} from './peerConnectionAtom'
import { PeerMessages } from '@/enums/PeerMessages'

// reexporting this as nextjs complains
export enum PeerErrorType {
  BrowserIncompatible = 'browser-incompatible',
  Disconnected = 'disconnected',
  InvalidID = 'invalid-id',
  InvalidKey = 'invalid-key',
  Network = 'network',
  PeerUnavailable = 'peer-unavailable',
  SslUnavailable = 'ssl-unavailable',
  ServerError = 'server-error',
  SocketError = 'socket-error',
  SocketClosed = 'socket-closed',
  UnavailableID = 'unavailable-id',
  WebRTC = 'webrtc',
}

export interface PeerProps {
  peerId: string | null
  keypair: Keypair | null
  onError?: (err: { type: PeerErrorType }) => void
}

export interface PeerInstance {
  peer: Peer | null
  sendMessage: (receiverId: string, message: any) => Promise<void>
  clearMessages: (from: string) => void
}

// always end up overengineering this ¯\_(ツ)_/¯
export function usePeer({ peerId, keypair, onError }: PeerProps): PeerInstance {
  const [peer, setPeer] = useAtom(peerListAtom(peerId ?? ''))
  const [connections, setConnections] = useAtom(connectionListAtom)
  const [messages, setMessages] = useAtom(messagesAtom)
  const setOpen = useSetAtom(peerOpenAtom)

  const setupConnection = useCallback(
    (conn: DataConnection) => {
      conn.off('data')
      conn.off('close')

      conn.on('data', (payload) => {
        const { data, from, signature } = payload as PeerMessage

        console.log(`Recieving data from ${from}: `, data)

        let valid = false
        try {
          valid = sign.detached.verify(
            Buffer.from(JSON.stringify(data)),
            bs58.decode(signature),
            bs58.decode(from),
          )
        } catch (e) {
          console.error(e)
        }

        if (valid) {
          setMessages((m) => [...m, { data, from, signature }])
        }
      })

      conn.on('close', () => {
        // console.log(`Connection closed ${conn.peer}`)
        setConnections((c) => c.filter((i) => i.peer !== conn.peer))
      })

      setConnections((connections) => {
        if (connections.find((i) => i.peer === conn.peer)) {
          return connections
        }

        console.log(
          `Connection established ${conn.peer}`,
          conn.peerConnection.connectionState,
        )

        return [...connections, conn]
      })
    },
    [setConnections, setMessages],
  )

  const debounceId = useRef<number | undefined>()
  useEffect(() => {
    if (peer === null) {
      if (debounceId.current) {
        window.clearTimeout(debounceId.current)
      }
      debounceId.current = window.setTimeout(() => {
        setPeer((oldPeer) => {
          if (
            oldPeer?.id === peerId &&
            !(oldPeer.destroyed || oldPeer.disconnected)
          ) {
            return oldPeer
          }

          oldPeer?.destroy()

          if (peerId === null) return null

          const newPeer = new Peer(peerId)

          newPeer.on('connection', setupConnection)

          newPeer.on('open', () => {
            console.log(`Peer opened ${peerId}`)
            setOpen(true)
          })

          newPeer.on('error', (err: any) => {
            console.log(`Peer error ${peerId}: ${JSON.stringify(err)}`)
            onError?.(err)
          })

          newPeer.on('close', () => {
            console.log(`Peer closed ${peerId}`)
            // TODO: investigate net disconnection (setTimeout?)
            setPeer(null)
            setOpen(false)
          })

          setConnections((connections) => {
            connections.forEach((conn) => conn.close())
            return []
          })

          return newPeer
        })
      }, 50)
    }
    return () => {
      if (peer !== null && peer.disconnected) {
        peer.destroy()
        setPeer(null)
      }
    }
  }, [peer, keypair, peerId, onError, setPeer, setOpen, setConnections])

  const sendMessage = useCallback(
    async (receiverId: string, message: any) => {
      if (!peer || !keypair) return

      const payload: PeerMessage = {
        from: keypair.publicKey.toBase58(),
        data: message,
        signature: bs58.encode(
          sign.detached(
            Buffer.from(JSON.stringify(message)),
            keypair.secretKey,
          ),
        ),
      }

      let connection = connections.find((conn) => conn.peer === receiverId)

      if (!connection) {
        connection = await new Promise<DataConnection>((resolve, reject) => {
          const peerErr = (err: any) => {
            peer.off('error', peerErr)
            reject(err)
          }

          peer.on('error', peerErr)

          const newConnection = peer.connect(receiverId, {
            // serialization: 'json',
            reliable: true,
          })

          if (
            !newConnection ||
            newConnection.peerConnection.connectionState === 'failed'
          ) {
            peer.off('error', peerErr)
            reject('Remote peer is possibly destroyed / disconnected.')
            return
          }

          newConnection.on('error', (err) => {
            peer.off('error', peerErr)
            reject(err)
          })

          newConnection.on('open', () => {
            newConnection.off('error')
            peer.off('error', peerErr)
            resolve(newConnection)
          })
        })

        // setupConnection(connection)
      }

      setupConnection(connection)
      console.log(`Sending message to ${receiverId}: `, message)
      if (message.type === PeerMessages.GAME_TURN) {
        console.log('Sending', message)
      }

      connection.send(payload, false)
    },
    [keypair, peer, connections, setConnections],
  )

  const clearMessages = useCallback(
    (from: string) => {
      const hasMessage = !!messages.find((m) => m.from === from)
      if (hasMessage) {
        setMessages((messages) => {
          return messages.filter((m) => m.from !== from)
        })
      }
    },
    [messages, setMessages],
  )

  return { peer, sendMessage, clearMessages }
}

export default function PeerConnectionIndicator({
  className,
}: {
  className?: string
}) {
  const peerConnected = useAtomValue(peerOpenAtom)
  return (
    <span
      className={classNames(
        peerConnected ? 'bg-green-600' : 'bg-red-600',
        'w-2 h-2 rounded-full flex-none inline-block',
        className,
      )}
    />
  )
}
