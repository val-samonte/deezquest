use anchor_lang::prelude::*;

declare_id!("4eMRK1vkaB3qN7Hxxdvu48bjaTb4bAKsh4KDTeffcu9Z");

#[program]
pub mod deezquest {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
