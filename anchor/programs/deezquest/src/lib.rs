use anchor_lang::prelude::*;

mod instructions;
mod states;

use instructions::*;

declare_id!("4eMRK1vkaB3qN7Hxxdvu48bjaTb4bAKsh4KDTeffcu9Z");

#[program]
pub mod deezquest {
    use super::*;

    pub fn init(ctx: Context<Init>, params: InitParams) -> Result<()> {
        init_handler(ctx, params)
    }

    pub fn create_season(ctx: Context<CreateSeason>, params: CreateSeasonParams) -> Result<()> {
        create_season_handler(ctx, params)
    }
}
