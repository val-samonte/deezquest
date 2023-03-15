use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

use crate::states::{Game, Hero, MatchEntry};

#[derive(Accounts)]
pub struct CreateGame<'info> {
    #[account(
        init,
        payer = burner_account,
        seeds = [b"game", player_match_entry.key().as_ref()],
        bump,
        space = Game::len(),
    )]
    pub game: Box<Account<'info, Game>>,

    pub player_match_entry: Box<Account<'info, MatchEntry>>,

    #[account(
        constraint = Some(opponent_match_entry.key()) == player_match_entry.paired_match
    )]
    pub opponent_match_entry: Box<Account<'info, MatchEntry>>,

    #[account(
        associated_token::mint = hero_nft_mint,
        associated_token::authority = owner,
        constraint = hero_nft.amount == 1,
    )]
    pub hero_nft: Account<'info, TokenAccount>,

    #[account(
        constraint = hero_nft_mint.supply == 1,
        constraint = hero_nft_mint.decimals == 0,
    )]
    pub hero_nft_mint: Account<'info, Mint>,

    #[account(
        constraint = owner.key() == player_match_entry.owner.key()
    )]
    /// CHECK: constraint to player_match_entry
    pub owner: UncheckedAccount<'info>,

    #[account(
        mut,
        constraint = burner_account.key() == player_match_entry.burner_account.key()
    )]
    pub burner_account: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn create_game_handler(ctx: Context<CreateGame>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let burner = &ctx.accounts.burner_account;

    game.bump = *ctx.bumps.get("game").unwrap();
    game.authority = burner.key();
    game.player_hero = Hero::from_pubkey(&ctx.accounts.hero_nft_mint.key()).into_bytes();
    game.game_state = 0;
    game.current_turn = None;

    Ok(())
}
