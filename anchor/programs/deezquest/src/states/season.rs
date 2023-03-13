use anchor_lang::prelude::*;

#[account]
pub struct Season {
    /// Bump nonce of the PDA. (1)
    pub bump: u8,

    /// Bump nonce of rating token for this season. (1)
    pub season_rating_mint_bump: u8,

    /// Counter to keep track of the registered players for this season.
    /// Can be possibly used as deez coin rewards multiplier (more players, more coins). (8)
    pub registered_players: u64,

    /// Additional metadata for this season. (4 + varies)
    pub uri: String,

    /// Unused reserved byte space for future additive changes. (128)
    pub _reserved: [u8; 128],
}

impl Season {
    pub fn len(uri: String) -> usize {
        8 + 1 + 1 + 8 + (4 + uri.len()) + 128
    }
}
