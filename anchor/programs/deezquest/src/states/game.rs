use anchor_lang::{prelude::*, solana_program::hash::hashv};

#[account(zero_copy)]
pub struct Game {
    /// Bump nonce of the PDA. (1)
    bump: u8,

    /// The burner account of the player.
    authority: Pubkey,

    /// State of the player.
    player_hero: [u8; 22],

    /// State of the opponent.
    opponent_hero: [u8; 22],

    /// 0 - pending, 1 - win, 2 - lose, 3 - draw
    game_state: u8,

    /// Representation of the board.
    /// TODO: this is wasteful, can be reduced to 3 bits per cell
    tiles: [u8; 64],

    /// Starting hash of the game.
    /// Should be the combination of hashes of the burner pubkeys.
    root_hash: [u8; 32],

    /// Current hash of the game.
    /// Used for the "randomness" of the board.
    game_hash: [u8; 32],

    /// Mint address of the NFT who is currently allowed to make a move.
    current_turn: Pubkey,

    /// Turns made by either player, capped at 100 turns.
    /// Reaching 100, the game should compare the HP of both players.
    /// Highest HP wins. If HP is the same, result is draw.
    turns: [u8; 100],
}

impl Game {
    pub fn len() -> usize {
        8 + 1 + 32 + 22 + 22 + 1 + 64 + 32 + 32 + 32 + 100
    }
}

pub struct Hero {
    hp: u8,
    hp_cap: u8,
    armor: u8,
    shell: u8,
    turn_time: u8,
    base_dmg: u8,
    fire_mp: u8,
    fire_mp_cap: u8,
    wind_mp: u8,
    wind_mp_cap: u8,
    watr_mp: u8,
    watr_mp_cap: u8,
    eart_mp: u8,
    eart_mp_cap: u8,
    attr_int: u8,
    attr_spd: u8,
    attr_vit: u8,
    attr_str: u8,
    weight: u8,
    offensive_skill: u8,
    supportive_skill: u8,
    special_skill: u8,
}

// TODO: i don't know what i am doing :D
impl Hero {
    pub fn from_bytes(serialized: [u8; 22]) -> Hero {
        Hero {
            hp: serialized[0],
            hp_cap: serialized[1],
            armor: serialized[2],
            shell: serialized[3],
            turn_time: serialized[4],
            base_dmg: serialized[5],
            fire_mp: serialized[6],
            fire_mp_cap: serialized[7],
            wind_mp: serialized[8],
            wind_mp_cap: serialized[9],
            watr_mp: serialized[10],
            watr_mp_cap: serialized[11],
            eart_mp: serialized[12],
            eart_mp_cap: serialized[13],
            attr_int: serialized[14],
            attr_spd: serialized[15],
            attr_vit: serialized[16],
            attr_str: serialized[17],
            weight: serialized[18],
            offensive_skill: serialized[19],
            supportive_skill: serialized[20],
            special_skill: serialized[21],
        }
    }

    pub fn into_bytes(&self) -> [u8; 22] {
        [
            self.hp,
            self.hp_cap,
            self.armor,
            self.shell,
            self.turn_time,
            self.base_dmg,
            self.fire_mp,
            self.fire_mp_cap,
            self.wind_mp,
            self.wind_mp_cap,
            self.watr_mp,
            self.watr_mp_cap,
            self.eart_mp,
            self.eart_mp_cap,
            self.attr_int,
            self.attr_spd,
            self.attr_vit,
            self.attr_str,
            self.weight,
            self.offensive_skill,
            self.supportive_skill,
            self.special_skill,
        ]
    }

    pub fn from_pubkey(&pubkey: Pubkey) -> Hero {
        let [int, spd, vit, str] = get_hero_attributes(pubkey);
        let mut bytes = pubkey.to_bytes().as_ref();

        Hero {
            hp: 80 + vit * 2,
            hp_cap: 80 + vit * 2,
            armor: 0,
            shell: 0,
            turn_time: 0,
            base_dmg: str,
            fire_mp: 0,
            fire_mp_cap: 10 + int,
            wind_mp: 0,
            wind_mp_cap: 10 + int,
            watr_mp: 0,
            watr_mp_cap: 10 + int,
            eart_mp: 0,
            eart_mp_cap: 10 + int,
            int,
            spd,
            vit,
            str,
            weight: 0,
            offensive_skill: bytes[0] % 4,
            supportive_skill: (bytes[1] % 4) + 4,
            special_Skill: (bytes[2] % 4) + 8,
        }
    }
}

pub fn get_hero_attributes(&pubkey: Pubkey) -> Hero {
    let mut attribs: [u8; 4] = [
        1, // INT - Mana cap increase
        1, // SPD - More likely to get a turn
        1, // VIT - Flat HP increase
        1, // STR - Able to carry heavier equipment, base damage
    ];
    let mut cursor = 0;
    let mut remaining = 17;
    let mut bytes = pubkey.to_bytes().as_ref();

    let mut i = 0;
    while i < u8::MAX && remaining > 0 {
        if bytes[i % 32] % 2 == 0 || attribs[cursor] == 10 {
            cursor = (cursor + 1) % 4;
        } else {
            attribs[cursor] += 1;
            remaining -= 1;
        }

        i += 1;
    }

    if remaining != 0 {
        attribs = [5, 5, 5, 5];
        attribs[bytes[0] % 4] += 1;
    }

    attribs
}

pub fn apply_damage(
    &mut hero: Hero,
    physical: Option<u8>,
    magical: Option<u8>,
    ignore_armor: Option<bool>,
    ignore_shell: Option<bool>,
) -> Result<Ok> {
    physical = physical.unwrap_or(0);
    magical = magical.unwrap_or(0);
    ignore_armor = ignore_armor.unwrap_or(false);
    ignore_shell = ignore_shell.unwrap_or(false);

    if !ignore_armor {
        if hero.armor < physical {
            physical -= hero.armor;
            hero.armor = 0;
        } else {
            hero.armor -= physical;
            physical = 0;
        }
    }

    if !ignore_shell {
        if hero.shell < magical {
            magical -= hero.shell;
            hero.shell = 0;
        } else {
            hero.shell -= magical;
            magical = 0;
        }
    }

    hero.hp -= physical + magical;

    hero
}

// TODO: simplify this, create a pure function to cap value (Math.max?)
pub fn add_hp(&mut hero: Hero, amount: u8) -> Hero {
    hero.hp += amount;
    if hero.hp > hero.hp_cap {
        hero.hp = hero.hp_cap;
    }
    hero
}

pub fn absorb_mana(&mut hero: Hero, absorbed_mana: [u8; 4]) -> Hero {
    hero.fire_mp += absorbed_mana[0];
    hero.wind_mp += absorbed_mana[1];
    hero.watr_mp += absorbed_mana[2];
    hero.eart_mp += absorbed_mana[3];

    if hero.fire_mp > hero.fire_mp_cap {
        hero.fire_mp = hero.fire_mpCap;
    }
    if hero.wind_mp > hero.wind_mp_cap {
        hero.wind_mp = hero.wind_mpCap;
    }
    if hero.watr_mp > hero.watr_mp_cap {
        hero.watr_mp = hero.watr_mpCap;
    }
    if hero.eart_mp > hero.eart_mp_cap {
        hero.eart_mp = hero.eart_mpCap;
    }

    hero
}

pub fn get_next_turn(
    &mut hero1: Hero,
    &mut hero2: Hero,
    &pubkey1: [u8; 32],
    &pubkey2: [u8; 32],
    &game_hash: [u8; 32],
) -> (Hero, [u8; 32]) {
    while hero1.turn_time < 200 && hero2.turn_time < 200 {
        hero1.turn_time += hero1.spd + 10;
        hero2.turn_time += hero2.spd + 10;
    }

    if hero1.turn_time >= 200 && hero2.turn_time >= 200 {
        let seq1 = [
            hero1.turn_time,
            hero1.spd,
            hero1.vit,
            hero1.str,
            hero1.int,
            hero1.hp,
        ];
        let seq2 = [
            hero2.turn_time,
            hero2.spd,
            hero2.vit,
            hero2.str,
            hero2.int,
            hero2.hp,
        ];

        let mut i = 0;
        while i < 6 {
            if seq1[i] > seq2[i] {
                return (hero1, pubkey1);
            } else if seq1[i] < seq2[i] {
                return (hero2, pubkey2);
            }
        }

        // random using game hash
        let hash1 = hashv(&[&pubkey1, &game_hash]);
        let seq1 = &hash.to_bytes()[..32];

        let hash2 = hashv(&[&pubkey2, &game_hash]);
        let seq2 = &hash.to_bytes()[..32];

        let mut i = 0;
        while i < 32 {
            if seq1[i] > seq2[i] {
                return (hero1, pubkey1);
            } else if seq1[i] < seq2[i] {
                return (hero2, pubkey2);
            }
        }

        panic!("Heroes are too identical, even having the same public key hash result.");
    } else if hero1.turn_time >= 200 {
        return (hero1, pubkey1);
    }

    (hero2, pubkey2)
}
