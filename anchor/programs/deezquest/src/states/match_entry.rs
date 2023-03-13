use anchor_lang::prelude::*;

#[account]
pub struct MatchEntry {
    /// Bump nonce of the PDA. (1)
    pub bump: u8,

    /// Player who owns this PDA. (32)
    pub owner: Pubkey,

    /// What season is this match for. (32)
    pub season: Pubkey,

    /// We have to store the rating as well to offload some burden from the frontend. (8)
    pub rating: u64,

    /// Burner account who is authorized to perform game related ix calls. (32)
    pub burner_account: Pubkey,

    /// Seed so that the player can retrieve the burner keypair regardless of device. (16)
    pub burner_nonce: [u8; 16],

    /// Seed used to get the peer ID of this owner for P2P communication. (16)
    pub peer_nonce: [u8; 16],

    /// SHA 256 of code verifier, kept by the owner.
    /// If the owner decided to accept a match invitation,
    /// both are required to exchange their own code verifiers via P2P. (16)
    pub code_challenge: [u8; 16],

    /// Game PDA of the opponent who received the code verifier from the owner. (1 + 32)
    pub paired_game: Option<Pubkey>,
}

impl MatchEntry {
    pub fn len() -> usize {
        8 + 1 + 32 + 32 + 8 + 32 + 16 + 16 + 16 + (1 + 32)
    }
}
