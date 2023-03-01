'use client'

import Peer, { DataConnection } from 'peerjs'
import { atom, useAtom, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Keypair } from '@solana/web3.js'
import { sign } from 'tweetnacl'
import bs58 from 'bs58'
import { atomFamily, atomWithStorage, createJSONStorage } from 'jotai/utils'

export interface PeerMessage {
  from: string // base58 encoded
  data: any
  signature: string // base58 encoded
}

const peerBaseAtom = atom<Peer | null>(null)

// const peerListAtom = atomFamily((id: string) => atom<Peer | null>(null))
const peerOpenAtom = atom(false)
const connectionListAtom = atom<DataConnection[]>([])
const messagesAtom = atom<PeerMessage[]>([])

// always end up overengineering this ¯\_(ツ)_/¯
export function usePeer(keypair: Keypair) {
  const peerId = useMemo(() => keypair?.publicKey.toBase58(), [keypair])
  const [peer, setPeer] = useAtom(peerBaseAtom)
  const [isOpen, setOpen] = useAtom(peerOpenAtom)
  const [connections, setConnections] = useAtom(connectionListAtom)
  const [messages, setMessages] = useAtom(messagesAtom)

  const setupConnection = useCallback(
    (conn: DataConnection) => {
      conn.off('data')
      conn.off('close')

      conn.on('data', (payload) => {
        const { data, from, signature } = payload as PeerMessage

        console.log(`Recieving data from ${from}: `, data)

        const valid = sign.detached.verify(
          Buffer.from(JSON.stringify(data)),
          bs58.decode(signature),
          bs58.decode(from),
        )

        if (valid && from === conn.peer) {
          setMessages((m) => [...m, { data, from, signature }])
        }
      })

      conn.on('close', () => {
        setConnections((c) => c.filter((i) => i.peer !== conn.peer))
      })

      setConnections((connections) => {
        if (connections.find((i) => i.peer === conn.peer)) {
          return connections
        }

        console.log(`Connection established ${conn.peer}`)

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

          newPeer.on('error', (err) => {
            console.log(`Peer error ${peerId}: ${JSON.stringify(err)}`)
          })

          newPeer.on('close', () => {
            console.log(`Peer closed ${peerId}`)
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
      if (peer !== null) {
        // this will ensure creation of a fresh peer client
        peer.disconnected && peer.destroy()
        setPeer(null)
      }
    }
  }, [peer, peerId, setPeer, setOpen, setConnections])

  const sendMessage = useCallback(
    async (receiverId: string, message: any) => {
      if (!peer) return

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

          if (!newConnection) {
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

        setupConnection(connection)
      }

      setupConnection(connection)
      console.log(`Sending message to ${receiverId}: `, message)

      connection.send(payload, false)
    },
    [keypair, peer, connections, setConnections],
  )

  const clearMessages = useCallback(
    (from: string) => {
      setMessages((messages) => {
        return messages.filter((m) => m.from !== from)
      })
    },
    [setMessages],
  )

  return { peer, isOpen, messages, connections, sendMessage, clearMessages }
}
