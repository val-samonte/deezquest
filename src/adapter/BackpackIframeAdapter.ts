import {
  BaseMessageSignerWalletAdapter,
  WalletName,
  WalletReadyState,
} from '@solana/wallet-adapter-base'
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import bs58 from 'bs58'

// original code by nelsontky
// https://github.com/nelsontky/web3-plays-pokemon/blob/1b20a70039f10ae550e41a3bb31f43074b333d2f/packages/ui/adapters/BackpackIframeAdapter.tsx

const BACKPACK_ORIGIN =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:19006'
    : 'https://xnfts.s3.us-west-2.amazonaws.com'

export const BackpackIframeWalletName =
  'Backpack Iframe' as WalletName<'Backpack Iframe'>

export class BackpackIframeAdapter extends BaseMessageSignerWalletAdapter {
  name = BackpackIframeWalletName
  url = 'https://backpack.app'
  icon =
    'data:image/png;base64,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'

  private _readyState = WalletReadyState.Installed
  private _publicKey: PublicKey | null = null
  private _connecting = false
  readonly supportedTransactionVersions = null

  constructor(publicKey: PublicKey) {
    super()
    this._publicKey = publicKey
  }

  static async make() {
    // console.log('INITIALIZING XNFT', BACKPACK_ORIGIN)
    window.parent.postMessage(
      JSON.stringify({
        action: 'publicKey',
      }),
      BACKPACK_ORIGIN,
    )
    const publicKey = await getXnftResultPromise<string>()
    return new BackpackIframeAdapter(new PublicKey(publicKey))
  }

  get publicKey() {
    return this._publicKey
  }

  get connecting() {
    return this._connecting
  }

  get connected() {
    return !!this._publicKey
  }

  get readyState() {
    return this._readyState
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    try {
      window.parent.postMessage(
        JSON.stringify({
          action: 'signMessage',
          payload: bs58.encode(message),
        }),
        BACKPACK_ORIGIN,
      )

      const signedMessage = bs58.decode(await getXnftResultPromise<string>())

      return signedMessage
    } catch (error: any) {
      this.emit('error', error)
      throw error
    }
  }

  async signTransaction<T extends Transaction>(transaction: T): Promise<T> {
    try {
      window.parent.postMessage(
        JSON.stringify({
          action: 'signTransaction',
          payload: bs58.encode(
            Uint8Array.from(transaction.serialize({ verifySignatures: false })),
          ),
        }),
        BACKPACK_ORIGIN,
      )

      const payload = await getXnftResultPromise<string>()

      return Transaction.from(bs58.decode(payload)) as T
    } catch (error: any) {
      this.emit('error', error)
      throw error
    }
  }

  connect(): Promise<void> {
    this.emit('connect', this._publicKey as PublicKey)
    return Promise.resolve()
  }

  disconnect(): Promise<void> {
    this.emit('disconnect')
    return Promise.resolve()
  }
}

const getXnftResultPromise = <U>(): Promise<U> =>
  new Promise((resolve, reject) => {
    const listener = (event: MessageEvent<any>) => {
      if (event.origin !== BACKPACK_ORIGIN) {
        // throw new Error(
        //   `Invalid origin ${event.origin}, expecting ${BACKPACK_ORIGIN}`,
        // )
        console.log(
          `Invalid origin ${event.origin}, expecting ${BACKPACK_ORIGIN}`,
        )
        return
      }
      window.removeEventListener('message', listener)
      const result = JSON.parse(event.data)
      if (result.success) {
        resolve(result.payload)
      } else {
        reject(new Error(result.payload))
      }
    }
    window.addEventListener('message', listener)
  })
