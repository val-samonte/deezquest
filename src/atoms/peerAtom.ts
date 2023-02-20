import Peer, { DataConnection } from 'peerjs'
import { atom, useAtom, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'
import { Keypair } from '@solana/web3.js'
import { sign } from 'tweetnacl'
import bs58 from 'bs58'

interface PeerMessage {
  from: string // base58 encoded
  data: any
  signature: string // base58 encoded
}

const peerBaseAtom = atom<Peer | null>(null)
const connectionListAtom = atom<DataConnection[]>([])
const messageAtom = atom<PeerMessage[]>([])

function usePeer(keypair: Keypair) {
  const [peer, setPeer] = useAtom(peerBaseAtom)
  const [connections, setConnections] = useAtom(connectionListAtom)
  const setMessages = useSetAtom(messageAtom)
  const peerId = useMemo(() => keypair.publicKey.toBase58(), [keypair])

  const setupConnection = useCallback(
    (conn: DataConnection) => {
      setConnections((connections) => {
        if (connections.find((i) => i.peer === conn.peer)) return connections
        conn.on('data', (data) => {
          // TODO: verify signature first
        })

        conn.on('close', () => {
          setConnections((c) => c.filter((i) => i.peer !== conn.peer))
        })

        return [...connections, conn]
      })
    },
    [setConnections, setMessages],
  )

  useEffect(() => {
    if (peer && peer.id !== peerId) {
      // clean up
      setPeer((oldPeer) => {
        oldPeer?.destroy()
        const peer = new Peer(peerId)
        peer.on('connection', setupConnection)
        return peer
      })
      // clear existing connections
      setConnections((connections) => {
        connections.forEach((conn) => conn.close())
        return []
      })
    }
  }, [peerId, setPeer, setConnections])

  const sendMessage = useCallback(
    async (receiverId: string, message: any) => {
      if (!peer) return

      const payload: PeerMessage = {
        from: keypair.publicKey.toBase58(),
        data: message,
        signature: bs58.encode(
          sign(Buffer.from(JSON.stringify(message)), keypair.secretKey),
        ),
      }

      let connection = connections.find((conn) => conn.peer === receiverId)

      if (!connection) {
        const newConnection = peer.connect(receiverId, {
          serialization: 'json',
        })

        await new Promise<void>((resolve, reject) => {
          newConnection.on('error', reject)

          newConnection.on('open', () => {
            newConnection.off('error')
            resolve()
          })
        })

        connection = newConnection

        setupConnection(connection)
      }

      connection.send(payload)
    },
    [keypair, peer, connections, setConnections],
  )

  return { peer, sendMessage }
}
