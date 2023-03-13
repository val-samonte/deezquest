use anchor_lang::prelude::*;
use anchor_spl::{token::{TokenAccount, Mint, Token}, associated_token::AssociatedToken};

use crate::states::{MatchEntry, Season};

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct CreateMatchEntryParams {
    pub burner_nonce: [u8; 16],
    pub peer_nonce: [u8; 16],
    pub code_challenge: [u8; 16],
}

#[derive(Accounts)]
#[instruction(params: CreateMatchEntryParams)]
pub struct CreateMatchEntry<'info> {

    #[account(
        init,
        payer = owner, 
        // TODO: should this be enough to block the player from creating another match?
        seeds = [b"match_entry", owner.key().as_ref()],
        bump,
        space = MatchEntry::len(),
    )]
    pub match_entry: Account<'info, MatchEntry>,

    #[account(
        associated_token::mint = season_rating_mint,
        associated_token::authority = owner,
    )]
    pub season_rating_token: Account<'info, TokenAccount>,

    #[account(
        seeds = [b"season_rating_mint", season.key().as_ref()],
        bump = season.season_rating_mint_bump,
    )]
    pub season_rating_mint: Account<'info, Mint>,

    pub season: Box<Account<'info, Season>>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub burner_account: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn create_match_entry_handler(ctx: Context<CreateMatchEntry>, params: CreateMatchEntryParams) -> Result<()> {
    let match_entry = &mut ctx.accounts.match_entry;

    match_entry.bump = *ctx.bumps.get("match_entry").unwrap();
    match_entry.owner = ctx.accounts.owner.key();
    match_entry.season = ctx.accounts.season.key();
    match_entry.rating = ctx.accounts.season_rating_token.amount;
    match_entry.burner_account = ctx.accounts.burner_account.key();
    match_entry.burner_nonce = params.burner_nonce;
    match_entry.peer_nonce = params.peer_nonce;
    match_entry.code_challenge = params.code_challenge;
    match_entry.paired_game = None;

    Ok(())
}