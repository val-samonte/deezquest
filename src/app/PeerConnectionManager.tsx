// Peer Connection:
// NOTE: STORING THE NONCE IS NOT REQUIRED DURING FRIENDLY MATCHES
// for p2p, we need another nonce as well, which is colocated in the same PDA with
// the burner nonce. eg.
//
// export const peerIdAtom = atom((get) => {
//   const kp = get(burnerKeypairAtom)
//   return kp ? getNextHash([kp.publicKey.toBytes(), Buffer.from('[ON_CHAIN_P2P_NONCE]')]) : null
// })
//
// opponent simply needs to listen to the PDA account for any p2p_nonce changes OR
// the player can submit another ping message to the opponent, making the opponent dismiss the old peer connection.
// as long as the player can sign the message using the burner account, opponent can always verify
// the authencity of the message.

// Accepting Match:
// if both parties agreed to start the match (in p2p), both will exchange the code solution
// to solve each respective code challenge stored in the "MatchAccountPDA"

export default function PeerConnectionManager() {
  return null
}
