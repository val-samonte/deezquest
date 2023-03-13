use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};

use crate::states::{Season, Main};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateSeasonParams {
    uri: String,
}

#[derive(Accounts)]
#[instruction(params: CreateSeasonParams)]
pub struct CreateSeason<'info> {

    #[account(
        init,
        payer = authority,
        seeds = [b"season", main.season_count.to_le_bytes().as_ref()],
        bump,
        space = Season::len(params.uri)
    )]
    pub season: Account<'info, Season>,

    #[account(
        init,
        payer = authority,
        seeds = [b"season_rating_mint", season.key().as_ref()],
        bump,
        mint::decimals = 1,
        mint::freeze_authority = season,
        mint::authority = season,
    )]
    pub season_rating_mint: Box<Account<'info, Mint>>,

    #[account(
        mut, 
        seeds = [b"main"],
        bump = main.bump,
    )]
    pub main: Account<'info, Main>,

    #[account(
        mut,
        constraint = authority.key() == main.maintenance_authority.key()
    )]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn create_season_handler(ctx: Context<CreateSeason>, params: CreateSeasonParams) -> Result<()> {
    let season = &mut ctx.accounts.season;

    season.bump = *ctx.bumps.get("season").unwrap();
    season.season_rating_mint_bump = *ctx.bumps.get("season_rating_mint").unwrap();
    season.registered_players = 0;
    season.uri = params.uri;

    Ok(())
}