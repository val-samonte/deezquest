use anchor_lang::{prelude::*, solana_program::program::invoke_signed};
use anchor_spl::token::{Mint, Token};
use mpl_token_metadata::instruction::create_metadata_accounts_v3;

use crate::{program::Deezquest, states::Main};

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct InitParams {
    pub maintenance_authority: Pubkey,
    pub treasury: Pubkey,
    pub service_fee: u64,
}

#[derive(Accounts)]
#[instruction(params: InitParams)]
pub struct Init<'info> {
    #[account(
        init,
        payer = upgrade_authority,
        seeds = [
            "main".as_bytes(),
        ],
        bump,
        space = Main::len(),
    )]
    pub main: Account<'info, Main>,

    #[account(
        init,
        payer = upgrade_authority,
        seeds = [b"deez_coin"],
        bump,
        mint::decimals = 0,
        mint::freeze_authority = main,
        mint::authority = main,
    )]
    pub deez_coin: Box<Account<'info, Mint>>,

    #[account(mut)]
    /// CHECK: manually validated in the handler
    pub deez_coin_metadata: UncheckedAccount<'info>,

    #[account(
        constraint = token_metadata_program.key() == mpl_token_metadata::ID
    )]
    /// CHECK: manually validated in the handler
    pub token_metadata_program: UncheckedAccount<'info>,

    #[account(
        constraint = program.programdata_address()? == Some(program_data.key())
    )]
    pub program: Program<'info, Deezquest>,

    #[account(
        constraint = program_data.upgrade_authority_address == Some(upgrade_authority.key())
    )]
    pub program_data: Account<'info, ProgramData>,

    #[account(mut)]
    pub upgrade_authority: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn init_handler(ctx: Context<Init>, params: InitParams) -> Result<()> {
    let main = &mut ctx.accounts.main;

    main.bump = *ctx.bumps.get("main").unwrap();
    main.deez_coin_bump = *ctx.bumps.get("deez_coin").unwrap();
    main.super_authority = Some(ctx.accounts.upgrade_authority.key());
    main.treasury = params.treasury.key();
    main.maintenance_authority = params.maintenance_authority.key();
    main.service_fee = params.service_fee;

    let mint_address = ctx.accounts.deez_coin.key();
    let metadata_seeds = &[
        b"metadata",
        mpl_token_metadata::ID.as_ref(),
        mint_address.as_ref(),
    ];

    let (metadata_pda, _bump) =
        Pubkey::find_program_address(metadata_seeds, &mpl_token_metadata::ID);

    if ctx.accounts.deez_coin_metadata.key() != metadata_pda {
        return Err(error!(InitError::InvalidDeezCoinMetadata));
    }

    let ix = create_metadata_accounts_v3(
        mpl_token_metadata::ID,
        metadata_pda,
        mint_address,
        main.key(),
        ctx.accounts.upgrade_authority.key(),
        main.key(),

        "Deez Coin".to_string(),
        "DZC".to_string(),
        "https://shdw-drive.genesysgo.net/EQUAMGwdZNwhuZxXVFeVmxVYd3ZWMhL1TYFoM1WScLgQ/deez_coin.json".to_string(),
        None,
        0,
        true,
        true,
        None,
        None,
        None,
    );

    let accts = &[
        main.to_account_info(), // mint_authority, update_authority
        ctx.accounts.deez_coin_metadata.to_account_info(), // metadata_account
        ctx.accounts.deez_coin.to_account_info(), // mint
        ctx.accounts.upgrade_authority.to_account_info(), // payer
        ctx.accounts.token_metadata_program.to_account_info(),
        ctx.accounts.system_program.to_account_info(), // system_program
        ctx.accounts.rent.to_account_info(),
    ];

    let main_seeds: &[&[u8]] = &[b"main", &[main.bump]];

    invoke_signed(&ix, accts, &[main_seeds]).unwrap();

    Ok(())
}

#[error_code]
pub enum InitError {
    #[msg("Invalid deez coin metadata")]
    InvalidDeezCoinMetadata,
}
