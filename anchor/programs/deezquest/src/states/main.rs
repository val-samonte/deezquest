use anchor_lang::prelude::*;

#[account]
pub struct Main {
    /// Bump nonce of the PDA. (1)
    pub bump: u8,

    /// Bump nonce of the main game currency.
    /// DeezCoin is only obtainable when playing ranked games. (1)
    pub deez_coin_bump: u8,

    /// The authority that is permitted to update this state.
    /// Intended to be unset at some point after making the program entirely immutable. (32)
    pub super_authority: Option<Pubkey>,

    /// The authority that is permitted to do balancing and changes to the game mechanics itself.
    /// This is expected to be multisig / handled by the community. (32)
    pub maintenance_authority: Pubkey,

    /// The wallet that stores the collected fees.
    /// Used for external services payment like hosting, rpc, maintainers salary, etc.
    /// At some point in time, this will be a PDA so that it will be managed by the program. (32)
    pub treasury: Pubkey,

    /// Small amount of fee being collected for services.
    /// Think of it as tax. (8)
    pub service_fee: u64,

    /// Unused reserved byte space for future additive changes. (128)
    pub _reserved: [u8; 128],
}

impl Main {
    pub fn len() -> usize {
        8 + 1 + 1 + 32 + 32 + 32 + 8 + 128
    }
}
