import { dappKey, verifyNonce } from '@/utils/nonce'
import bs58 from 'bs58'
import { sign } from 'tweetnacl'

export async function POST(request: Request) {
  const { message, signature } = await request.json()

  if (!message) {
    return new Response(null, {
      status: 400,
      statusText: 'Message is missing',
    })
  }

  if (!signature) {
    return new Response(null, {
      status: 400,
      statusText: 'Signature is missing',
    })
  }

  const id = message.split('\n').pop()
  const [pubkey, nonce] = id.split(':')

  let publicKey: Uint8Array
  try {
    publicKey = bs58.decode(pubkey)
  } catch (e) {
    return new Response(null, {
      status: 401,
      statusText: 'Invalid public key',
    })
  }

  if (!nonce || !verifyNonce(nonce)) {
    return new Response(null, {
      status: 401,
      statusText: 'Invalid nonce',
    })
  }

  if (
    !sign.detached.verify(
      Buffer.from(message),
      bs58.decode(signature),
      publicKey,
    )
  ) {
    return new Response(null, {
      status: 401,
      statusText: 'Invalid message / signature',
    })
  }

  const slice = sign.detached(publicKey, dappKey.secretKey).slice(0, 16)

  return new Response(slice)
}
