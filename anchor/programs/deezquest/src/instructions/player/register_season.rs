use anchor_lang::{prelude::*, system_program};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{FreezeAccount, Mint, MintTo, Token, TokenAccount},
};

use crate::states::{Main, Season};

#[derive(Accounts)]
pub struct RegisterSeason<'info> {
    #[account(
        init,
        payer = owner,
        associated_token::mint = season_rating_mint,
        associated_token::authority = owner,
    )]
    pub season_rating_token: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"season_rating_mint", season.key().as_ref()],
        bump = season.season_rating_mint_bump,
    )]
    pub season_rating_mint: Account<'info, Mint>,

    #[account(mut)]
    pub season: Box<Account<'info, Season>>,

    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        constraint = main.treasury.key() == treasury.key()
    )]
    /// CHECK: constraint to main's treasury
    pub treasury: UncheckedAccount<'info>,
    pub main: Account<'info, Main>,

    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn register_season_handler(ctx: Context<RegisterSeason>) -> Result<()> {
    // pay registration fee service
    let cpi_ctx = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.owner.to_account_info(),
            to: ctx.accounts.treasury.to_account_info(),
        },
    );
    system_program::transfer(cpi_ctx, ctx.accounts.main.service_fee)?;

    let token_program = &ctx.accounts.token_program;
    let season = &mut ctx.accounts.season;
    let season_rating_mint = &ctx.accounts.season_rating_mint;
    let season_rating_token = &ctx.accounts.season_rating_token;
    let season_bump = &season.bump.to_le_bytes();
    let season_id = season.id.to_le_bytes();

    season.registered_players += 1;

    let inner = vec![b"season".as_ref(), season_id.as_ref(), season_bump.as_ref()];
    let outer = vec![inner.as_slice()];

    let mint_ix = MintTo {
        mint: season_rating_mint.to_account_info(),
        to: season_rating_token.to_account_info(),
        authority: season.to_account_info(),
    };

    let cpi_ctx =
        CpiContext::new_with_signer(token_program.to_account_info(), mint_ix, outer.as_slice());

    let decimals = u32::from(season_rating_mint.decimals);

    anchor_spl::token::mint_to(cpi_ctx, 1200 * 10u64.pow(decimals))?; // 1200.0

    let freeze_ix = FreezeAccount {
        mint: season_rating_mint.to_account_info(),
        account: season_rating_token.to_account_info(),
        authority: season.to_account_info(),
    };

    let cpi_ctx =
        CpiContext::new_with_signer(token_program.to_account_info(), freeze_ix, outer.as_slice());

    anchor_spl::token::freeze_account(cpi_ctx)
}
