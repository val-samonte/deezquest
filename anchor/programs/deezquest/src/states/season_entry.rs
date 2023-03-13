use anchor_lang::prelude::*;

#[account]
pub struct SeasonEntry {
    /// Bump nonce of the PDA. (1)
    pub bump: u8,

    /// Owner of this entry / ticket. (32)
    pub owner: Pubkey,

    /// What season is this entry for. (32)
    pub season: Pubkey,

    /// Flag controlled by maintenance_authority.
    /// Whether the player is allowed to participate this season or not. (1)
    pub is_banned: bool,

    /// Used so that the player is blocked on creating / joining new matches. (1 + 32)
    pub existing_match: Option<Pubkey>,
}

impl SeasonEntry {
    pub fn len() -> usize {
        8 + 1 + 32 + 32 + 1 + (1 + 32)
    }
}
