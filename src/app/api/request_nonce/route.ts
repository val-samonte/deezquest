import { createNonce } from '@/utils/nonce'

export async function GET() {
  return new Response(createNonce())
}
