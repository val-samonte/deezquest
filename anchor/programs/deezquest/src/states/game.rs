use anchor_lang::{prelude::*, solana_program::hash::hashv};

use crate::instructions::player;

#[account]
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
    turns: [u8; 128],
}

impl Game {
    pub fn len() -> usize {
        8 + 1 + 32 + 22 + 22 + 1 + 64 + 32 + 32 + 32 + 100
    }
}

#[derive(Clone, Copy)]
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

    pub fn from_pubkey(pubkey: &Pubkey) -> Hero {
        let [int, spd, vit, str] = get_hero_attributes(pubkey);
        let bytes = pubkey.to_bytes();

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
            attr_int: int,
            attr_spd: spd,
            attr_vit: vit,
            attr_str: str,
            weight: 0,
            offensive_skill: bytes[0] % 4,
            supportive_skill: (bytes[1] % 4) + 4,
            special_skill: (bytes[2] % 4) + 8,
        }
    }
}

pub fn get_hero_attributes(pubkey: &Pubkey) -> [u8; 4] {
    let mut attribs: [u8; 4] = [
        1, // INT - Mana cap increase
        1, // SPD - More likely to get a turn
        1, // VIT - Flat HP increase
        1, // STR - Able to carry heavier equipment, base damage
    ];
    let mut cursor = 0;
    let mut remaining = 17;
    let bytes = pubkey.to_bytes();

    let mut i = 0;
    while i < u8::MAX && remaining > 0 {
        let idx: usize = (i % 32).into();
        if bytes[idx] % 2 == 0 || attribs[cursor] == 10 {
            cursor = (cursor + 1) % 4;
        } else {
            attribs[cursor] += 1;
            remaining -= 1;
        }

        i += 1;
    }

    if remaining != 0 {
        let idx: usize = (bytes[0] % 4).into();
        attribs = [5, 5, 5, 5];
        attribs[idx] += 1;
    }

    attribs
}

pub fn apply_damage(
    hero: &mut Hero,
    physical: Option<u8>,
    magical: Option<u8>,
    ignore_armor: Option<bool>,
    ignore_shell: Option<bool>,
) -> Hero {
    let mut physical = physical.unwrap_or(0);
    let mut magical = magical.unwrap_or(0);
    let ignore_armor = ignore_armor.unwrap_or(false);
    let ignore_shell = ignore_shell.unwrap_or(false);

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

    *hero
}

// TODO: simplify this, create a pure function to cap value (Math.max?)
pub fn add_hp(hero: &mut Hero, amount: u8) -> Hero {
    hero.hp += amount;
    if hero.hp > hero.hp_cap {
        hero.hp = hero.hp_cap;
    }
    *hero
}

pub fn absorb_mana(hero: &mut Hero, absorbed_mana: [u8; 4]) -> Hero {
    hero.fire_mp += absorbed_mana[0];
    hero.wind_mp += absorbed_mana[1];
    hero.watr_mp += absorbed_mana[2];
    hero.eart_mp += absorbed_mana[3];

    if hero.fire_mp > hero.fire_mp_cap {
        hero.fire_mp = hero.fire_mp_cap;
    }
    if hero.wind_mp > hero.wind_mp_cap {
        hero.wind_mp = hero.wind_mp_cap;
    }
    if hero.watr_mp > hero.watr_mp_cap {
        hero.watr_mp = hero.watr_mp_cap;
    }
    if hero.eart_mp > hero.eart_mp_cap {
        hero.eart_mp = hero.eart_mp_cap;
    }

    *hero
}

pub fn get_next_turn(
    hero1: &mut Hero,
    hero2: &mut Hero,
    pubkey1: &[u8; 32],
    pubkey2: &[u8; 32],
    game_hash: &[u8; 32],
) -> (Hero, [u8; 32]) {
    while hero1.turn_time < 200 && hero2.turn_time < 200 {
        hero1.turn_time += hero1.attr_spd + 10;
        hero2.turn_time += hero2.attr_spd + 10;
    }

    if hero1.turn_time >= 200 && hero2.turn_time >= 200 {
        let seq1 = [
            hero1.turn_time,
            hero1.attr_spd,
            hero1.attr_vit,
            hero1.attr_str,
            hero1.attr_int,
            hero1.hp,
        ];
        let seq2 = [
            hero2.turn_time,
            hero2.attr_spd,
            hero2.attr_vit,
            hero2.attr_str,
            hero2.attr_int,
            hero2.hp,
        ];

        let mut i = 0;
        while i < 6 {
            if seq1[i] > seq2[i] {
                return (*hero1, *pubkey1);
            } else if seq1[i] < seq2[i] {
                return (*hero2, *pubkey2);
            }
            i += 1;
        }

        // random using game hash
        let hash1 = hashv(&[pubkey1, game_hash]);
        let seq1 = &hash1.to_bytes()[..32];

        let hash2 = hashv(&[pubkey2, game_hash]);
        let seq2 = &hash2.to_bytes()[..32];

        let mut i = 0;
        while i < 32 {
            if seq1[i] > seq2[i] {
                return (*hero1, *pubkey1);
            } else if seq1[i] < seq2[i] {
                return (*hero2, *pubkey2);
            }
            i += 1;
        }

        panic!("Heroes are too identical, even having the same public key hash result.");
    } else if hero1.turn_time >= 200 {
        return (*hero1, *pubkey1);
    }

    (*hero2, *pubkey2)
}

pub fn hash_to_tiles(hash: &[u8; 32]) -> [Option<u8>; 64] {
    let mut tiles: [Option<u8>; 64] = [None; 64];
    let mut i = 0;
    while i < 32 {
        let byte = hash[i];

        tiles[i] = Some((byte * 0xf) % 7);
        tiles[i + 32] = Some(((byte >> 4) & 0xf) % 7);

        i += 1;
    }
    tiles
}

pub fn has_match(tiles: &[Option<u8>; 64]) -> bool {
    let mut i = 0;
    while i < 64 {
        let node_type = tiles[i];
        let col = i % 8;
        let row = i / 8;

        // vertical
        if row < 6 {
            if !node_type.is_none() && node_type == tiles[i + 8] && node_type == tiles[i + 16] {
                return true;
            }
        }

        // horizontal
        if col < 6 {
            if !node_type.is_none() && node_type == tiles[i + 1] && node_type == tiles[i + 2] {
                return true;
            }
        }

        i += 1;
    }

    false
}

pub fn get_matches(tiles: &[Option<u8>; 64]) -> ([Option<u8>; 64], [u8; 8], [u8; 7]) {
    let mut matches: [Option<u8>; 64] = [None; 64];
    let mut depths: [u8; 8] = [0; 8];
    let mut count: [u8; 7] = [0; 7];

    let mut i = 0;
    while i < 64 {
        let node_type = tiles[i];
        let col = i % 8;
        let row = i / 8;

        // vertical
        if row < 6 {
            if !node_type.is_none() && node_type == tiles[i + 8] && node_type == tiles[i + 16] {
                let node = node_type.unwrap() as usize;
                if matches[i].is_none() {
                    depths[col] += 1;
                    count[node] += 1;
                    matches[i] = node_type;
                }
                if matches[i + 8].is_none() {
                    depths[col] += 1;
                    count[node] += 1;
                    matches[i + 8] = node_type;
                }
                if matches[i + 16].is_none() {
                    depths[col] += 1;
                    count[node] += 1;
                    matches[i + 16] = node_type;
                }
            }
        }

        // horizontal
        if col < 6 {
            if !node_type.is_none() && node_type == tiles[i + 1] && node_type == tiles[i + 2] {
                let node = node_type.unwrap() as usize;
                if matches[i].is_none() {
                    depths[col] += 1;
                    count[node] += 1;
                    matches[i] = node_type;
                }
                if matches[i + 1].is_none() {
                    depths[col + 1] += 1;
                    count[node] += 1;
                    matches[i + 1] = node_type;
                }
                if matches[i + 2].is_none() {
                    depths[col + 2] += 1;
                    count[node] += 1;
                    matches[i + 2] = node_type;
                }
            }
        }

        i += 1;
    }

    (matches, depths, count)
}

pub fn substract(tiles: &[Option<u8>; 64], mask: &[Option<u8>; 64]) -> [Option<u8>; 64] {
    let mut result: [Option<u8>; 64] = [None; 64];

    let mut i = 0;
    while i < 64 {
        if mask[i].is_none() {
            result[i] = tiles[i];
        }
        i += 1;
    }

    result
}

pub fn apply_gravity(tiles: &mut [Option<u8>; 64], depths: [u8; 8]) -> [Option<u8>; 64] {
    let mut gravity_map: [Option<u8>; 64] = [None; 64];

    let mut i = 0;
    while i < 8 {
        if depths[i] == 0 {
            continue;
        };

        let mut gravity = 0;
        let mut blanks: Vec<usize> = Vec::new();

        let mut j = 7;
        while j >= 0 {
            let id: usize = j * 8 + i;

            if tiles[id].is_none() {
                gravity += 1;
                blanks.push(id);
                continue;
            }

            let mut k = 0;
            while k < blanks.len() {
                gravity_map[blanks[k]] = Some(
                    gravity
                        + match gravity_map[blanks[k]] {
                            Some(n) => n,
                            None => 0,
                        },
                );

                k += 1;
            }

            blanks = Vec::new();

            let node_type = tiles[id].unwrap();
            let dest = (j + (gravity as usize)) * 8 + i;
            tiles[id] = None;
            tiles[dest] = Some(node_type);
            gravity_map[id] = Some(gravity);

            j -= 1;
        }

        let mut k = 0;
        while k < blanks.len() {
            gravity_map[blanks[k]] = Some(
                gravity
                    + match gravity_map[blanks[k]] {
                        Some(n) => n,
                        None => 0,
                    },
            );

            k += 1;
        }

        i += 1;
    }

    gravity_map
}

pub fn fill(
    tiles: &mut [Option<u8>; 64],
    fillers: &[Option<u8>; 64],
    depths: &[u8; 8],
) -> [Option<u8>; 64] {
    let mut i = 0;
    while i < 8 {
        if depths[i] == 0 {
            continue;
        }
        let mut j = 0;
        while j < depths[i] {
            let id: usize = (j * 8) as usize + i;
            tiles[id] = fillers[id];
            j += 1;
        }
        i += 1;
    }
    *tiles
}

pub fn skill_count_per_mana(mana: [u8; 4], costs: &[Option<u8>; 4]) -> [Option<u8>; 4] {
    let mut result: [Option<u8>; 4] = [None; 4];
    let mut i = 0;

    while i < 4 {
        if costs[i].is_none() {
            continue;
        }
        let cost = costs[i].unwrap();

        if cost == 0 {
            result[i] = if mana[i] >= 1 { Some(1) } else { Some(0) };
            continue;
        }

        result[i] = Some(mana[i] / cost);

        i += 1;
    }

    result
}

pub fn is_executable(hero: &mut Hero, costs: &[Option<u8>; 4]) -> bool {
    let counts = skill_count_per_mana(
        [hero.fire_mp, hero.wind_mp, hero.watr_mp, hero.eart_mp],
        &costs,
    );

    let mut result = true;
    let mut i = 0;

    while i < 4 {
        if counts[i].is_none() {
            i += 1;
            continue;
        }
        if counts[i].unwrap() >= 1 {
            i += 1;
            continue;
        }

        result = false;
        break;
    }

    result
}

pub fn deduct_mana(hero: &mut Hero, costs: &[Option<u8>; 4]) -> Hero {
    // NOTE: 0 cost means ALL mana. None means literally no cost.
    let mut mana = [hero.fire_mp, hero.wind_mp, hero.watr_mp, hero.eart_mp];
    let mut i = 0;
    while i < 4 {
        if costs[i].is_none() {
            continue;
        }

        let cost = costs[i].unwrap();

        if cost == 0 {
            mana[i] = 0;
        } else {
            if mana[i] > cost {
                mana[i] -= cost;
            } else {
                mana[i] = 0;
            }
        }

        i += 1;
    }

    hero.fire_mp = mana[0];
    hero.wind_mp = mana[1];
    hero.watr_mp = mana[2];
    hero.eart_mp = mana[3];

    *hero
}

pub fn skill_cost(index: u8) -> [Option<u8>; 4] {
    // [fire, wind, water, earth]
    match index {
        // 'Burning Punch'
        0 => [Some(5), None, None, None],
        // 'Swift Strike'
        1 => [None, Some(3), None, None],
        // 'Aquashot'
        2 => [None, None, Some(4), None],
        // 'Crushing Blow'
        3 => [None, None, None, Some(0)],
        // 'Empower'
        4 => [Some(5), None, None, None],
        // 'Tailwind'
        5 => [None, Some(3), None, None],
        // 'Healing'
        6 => [None, None, Some(4), None],
        // 'Manawall'
        7 => [None, None, None, Some(0)],
        // 'Combustion'
        8 => [Some(8), None, None, None],
        // 'Tornado'
        9 => [None, Some(10), None, None],
        // 'Extinguish'
        10 => [None, None, Some(6), None],
        // 'Quake'
        11 => [None, None, None, Some(10)],
        // fallback
        _ => [None, None, None, None],
    }
}

pub fn skills(
    index: u8,
    command_level: u8,
    player: &mut Hero,
    opponent: &mut Hero,
    pre_command_player: Option<&Hero>,
    tiles: &Option<[Option<u8>; 64]>,
    game_hash: &Option<[u8; 32]>,
) -> (Hero, Hero, Option<[Option<u8>; 64]>, Option<[u8; 32]>) {
    match index {
        // 'Burning Punch'
        0 => {
            let atk = (player.base_dmg + command_level) * 2;
            let opponent_mp = opponent.fire_mp;
            let player_mp = pre_command_player.unwrap().fire_mp;
            let mag = if player_mp > opponent_mp {
                player_mp - opponent_mp
            } else {
                opponent_mp - player_mp
            };
            let mag = mag * if command_level == 3 { 2 } else { 1 };
            apply_damage(opponent, Some(atk), Some(mag), None, None);

            return (*player, *opponent, None, None);
        }
        // 'Swift Strike'
        1 => {
            let mut mag = match command_level {
                1 => 6,
                2 => 8,
                _ => 10,
            };

            if command_level == 3 {
                mag += if player.attr_spd > opponent.attr_spd {
                    player.attr_spd - opponent.attr_spd
                } else {
                    0
                };
                opponent.turn_time = if opponent.turn_time > 100 {
                    opponent.turn_time - 100
                } else {
                    0
                };
            }
            apply_damage(opponent, None, Some(mag), None, None);

            return (*player, *opponent, None, None);
        }
        // 'Aquashot'
        2 => {
            let mut mag = match command_level {
                1 => 4,
                2 => 12,
                _ => 16,
            };

            if command_level == 3 {
                mag += if player.attr_vit > opponent.attr_vit {
                    player.attr_vit - opponent.attr_vit
                } else {
                    0
                };
            }

            apply_damage(opponent, None, Some(mag), None, Some(command_level == 3));

            return (*player, *opponent, None, None);
        }
        // 'Crushing Blow'
        3 => {
            let pre_player = pre_command_player.unwrap();
            let mag = pre_player.eart_mp * 2;
            let mut atk = 0;
            if command_level > 1 && pre_player.eart_mp >= 5 {
                atk = player.attr_str;
            }
            apply_damage(opponent, Some(atk), Some(mag), None, None);
            if command_level == 3 {
                opponent.armor = 0;
            }
            return (*player, *opponent, None, None);
        }
        // 'Empower'
        4 => {
            player.base_dmg += command_level * 3;
            return (*player, *opponent, None, None);
        }
        // 'Tailwind'
        5 => {
            player.attr_spd += command_level;
            return (*player, *opponent, None, None);
        }
        // 'Healing'
        6 => {
            let mut heal = match command_level {
                1 => 6,
                2 => 8,
                _ => 10,
            };
            if command_level == 3 {
                heal += player.attr_vit * 2;
            }
            add_hp(player, heal);
            return (*player, *opponent, None, None);
        }
        // 'Manawall'
        7 => {
            let pre_player = pre_command_player.unwrap();
            player.shell += pre_player.eart_mp;
            if command_level > 1 && pre_player.eart_mp >= 5 {
                player.armor += player.attr_str;
            }
            return (*player, *opponent, None, None);
        }
        // 'Combustion'
        8 => {
            let mut count = 0;
            let mut new_tiles = tiles.unwrap().clone();
            let mut i = 0;
            while i < 64 {
                if new_tiles[i] == Some(5) {
                    count += 1;
                    new_tiles[i] = Some(3);
                }
                i += 1;
            }
            if count == 0 {
                return (*player, *opponent, Some(new_tiles), None);
            }

            let mag = count * 2;
            apply_damage(opponent, None, Some(mag), None, None);
            return (*player, *opponent, Some(new_tiles), None);
        }
        // 'Tornado'
        9 => {
            let new_hash = hashv(&[b"SHUFFLE", &game_hash.unwrap()]);
            let new_hash: &[u8; 32] = &new_hash.to_bytes()[..32].try_into().unwrap();
            let tiles = tiles.unwrap();
            let mut new_tiles = hash_to_tiles(new_hash);
            let mut count = 0;
            let mut i = 0;
            while i < 64 {
                if tiles[i].is_none() {
                    new_tiles[i] = None;
                } else if tiles[i] == Some(4) || tiles[i] == Some(6) {
                    count += 1;
                }
                i += 1;
            }
            apply_damage(opponent, None, Some(count), None, None);
            return (*player, *opponent, Some(new_tiles), Some(*new_hash));
        }
        // 'Extinguish'
        10 => {
            let mut count = 0;
            let mut new_tiles = tiles.unwrap().clone();
            let mut i = 0;
            while i < 64 {
                if new_tiles[i] == Some(3) {
                    count += 1;
                    new_tiles[i] = Some(5);
                }
                i += 1;
            }
            if count == 0 {
                return (*player, *opponent, Some(new_tiles), None);
            }

            let mag = count * 2;
            add_hp(player, mag);
            return (*player, *opponent, Some(new_tiles), None);
        }
        // 'Quake'
        11 => {
            let player_dmg = if player.wind_mp < 30 {
                30 - player.wind_mp
            } else {
                30
            };
            let opponent_dmg = if opponent.wind_mp < 30 {
                30 - player.wind_mp
            } else {
                30
            };

            apply_damage(player, None, Some(player_dmg), None, None);
            apply_damage(opponent, None, Some(opponent_dmg), None, None);

            return (*player, *opponent, None, None);
        }
        // Fallback
        _ => (*player, *opponent, None, None),
    }
}

pub struct CommandQueue {
    hero: Hero,
    skill: Option<u8>,
    lvl: Option<u8>,
    attack: Option<u8>,
    armor: Option<u8>,
}

pub fn executable_commands(
    original_hero: &Hero,
    absorbed_commands: &[u8; 3],
) -> ([bool; 3], Vec<CommandQueue>) {
    let mut hero = original_hero.clone();
    let mut flags = [false, false, false];
    let mut queue: Vec<CommandQueue> = Vec::new();

    if absorbed_commands[2] > 3 {
        let costs = skill_cost(hero.special_skill);
        if is_executable(&mut hero, &costs) {
            deduct_mana(&mut hero, &costs);
            queue.push(CommandQueue {
                hero: hero.clone(),
                skill: Some(hero.special_skill),
                lvl: None,
                attack: None,
                armor: None,
            });
            flags[2] = true;
        }
    }

    if absorbed_commands[1] > 2 {
        let costs = skill_cost(hero.supportive_skill);
        if is_executable(&mut hero, &costs) {
            deduct_mana(&mut hero, &costs);
            queue.push(CommandQueue {
                hero: hero.clone(),
                skill: Some(hero.supportive_skill),
                lvl: Some(if absorbed_commands[1] > 4 {
                    3
                } else if absorbed_commands[1] == 4 {
                    2
                } else {
                    1
                }),
                attack: None,
                armor: None,
            });
            flags[1] = true;
        } else {
            queue.push(CommandQueue {
                hero: hero.clone(),
                skill: None,
                lvl: None,
                attack: None,
                armor: Some(absorbed_commands[1]),
            });
        }
    }

    if absorbed_commands[0] > 2 {
        let costs = skill_cost(hero.offensive_skill);
        if is_executable(&mut hero, &costs) {
            deduct_mana(&mut hero, &costs);
            queue.push(CommandQueue {
                hero: hero.clone(),
                skill: Some(hero.offensive_skill),
                lvl: Some(if absorbed_commands[0] > 4 {
                    3
                } else if absorbed_commands[0] == 4 {
                    2
                } else {
                    1
                }),
                attack: None,
                armor: None,
            });
            flags[0] = true;
        } else {
            queue.push(CommandQueue {
                hero: hero.clone(),
                skill: None,
                lvl: None,
                attack: Some(absorbed_commands[0]),
                armor: None,
            });
        }
    }

    (flags, queue)
}

// This section should be done inside Game Create IX

// let match = get(matchAtom)
// let gameState = get(gameStateAtom)

// if (!match) return
// const player = match.player
// const opponent = match.opponent

// if (!gameState) {
//     if (!player || !opponent) throw Error('Missing player / opponent')

//     let playerHero = heroFromPublicKey(player.nft)
//     let opponentHero = heroFromPublicKey(opponent.nft)
//     let hash = bs58.decode(match.gameHash)

//     const heroInTurn = getNextTurn(
//     playerHero,
//     opponentHero,
//     new PublicKey(player.nft).toBytes(),
//     new PublicKey(opponent.nft).toBytes(),
//     hash,
//     )

//     const currentTurn = bs58.encode(heroInTurn.pubkey)

//     let tiles = new Array(64)
//     while (true) {
//     tiles = hashToTiles(hash)
//     if (!hasMatch(tiles)) {
//         break
//     }
//     hash = getNextHash([hash])
//     }

//     gameState = {
//     hashes: [bs58.encode(hash)],
//     currentTurn,
//     tiles,
//     players: {
//         [player.nft]: playerHero,
//         [opponent.nft]: opponentHero,
//     },
//     }

//     console.log('GameState Initialized', gameState)
// }

// This. This is the BOSS BATTLE.
pub fn swap_node() {
    // if (get(gameResultAtom) !== '') return
    //     if (isTransitioning) return
    //     if (action.data.publicKey !== gameState.currentTurn) return
    //     playerHero.turnTime -= 100

    //     const queue = get(gameTransitionQueueAtom)
    //     const tiles = gameState.tiles // queue[queue.length - 1].tiles

    //     const node1 = action.data.node1.y * 8 + action.data.node1.x
    //     const node2 = action.data.node2.y * 8 + action.data.node2.x

    //     if (tiles[node1] === tiles[node2]) return

    //     let newTiles = [...tiles] as (number | null)[]
    //     newTiles[node1] = tiles[node2]
    //     newTiles[node2] = tiles[node1]

    //     queue.push({
    //       type: GameTransitions.SWAP,
    //       turn: gameState.currentTurn,
    //       tiles: [...newTiles],
    //       heroes: {
    //         [gameState.currentTurn]: { ...playerHero },
    //       },
    //       nodes: {
    //         [node1]: {
    //           type: tiles[node2],
    //           from: {
    //             x: action.data.node2.x,
    //             y: action.data.node2.y,
    //           },
    //         },
    //         [node2]: {
    //           type: tiles[node1],
    //           from: {
    //             x: action.data.node1.x,
    //             y: action.data.node1.y,
    //           },
    //         },
    //       },
    //       duration: 450,
    //     })

    //     hash = getNextHash([
    //       Buffer.from('SWAP'),
    //       hash,
    //       Buffer.from(action.data.origin),
    //       bs58.decode(gameState.currentTurn),
    //     ])

    //     while (hasMatch(newTiles)) {
    //       const { matches, depths, count } = getMatches(newTiles)

    //       // count: [SWRD, SHLD, SPEC, FIRE, WIND, WATR, EART]
    //       playerHero = absorbMana(playerHero, count.slice(3)) // TODO: implement mana overflow
    //       const { flags, queue: commandsQueues } = executableCommands(
    //         { ...playerHero },
    //         count.slice(0, 3),
    //       )

    //       newTiles = subtract(newTiles, matches)
    //       queue.push({
    //         type: GameTransitions.DRAIN,
    //         turn: gameState.currentTurn,
    //         tiles: [...newTiles],
    //         heroes: {
    //           [gameState.currentTurn]: { ...playerHero },
    //         },
    //         nodes: matches.reduce((acc, cur, i) => {
    //           if (cur !== null) {
    //             let variation

    //             if (matches[i] === 0 && !flags[0] && count[0] > 2) {
    //               variation = GameTransitions.DRAIN_STAB
    //             } else if (matches[i] === 2 && (count[2] < 4 || !flags[2])) {
    //               variation = GameTransitions.DRAIN_FADE
    //             } else if (flags[matches[i]]) {
    //               variation = GameTransitions.DRAIN_GLOW
    //             }

    //             acc[i] = {
    //               variation,
    //               type: matches[i],
    //               from: {
    //                 x: i % 8,
    //                 y: Math.floor(i / 8),
    //               },
    //             }
    //           }
    //           return acc
    //         }, {}),
    //         duration: 600,
    //       })

    //       commandsQueues.forEach((command) => {
    //         if (command.attack) {
    //           opponentHero = applyDamage(
    //             { ...opponentHero }, // TODO: reduce unnecessary object clones
    //             playerHero.baseDmg + command.attack,
    //           )
    //           queue.push({
    //             type: GameTransitions.ATTACK_NORMAL,
    //             turn: gameState!.currentTurn,
    //             damage: opponentPubkey,
    //             heroes: {
    //               [opponentPubkey]: { ...opponentHero },
    //             },
    //             duration: 100,
    //           })
    //         } else if (command.armor) {
    //           playerHero.armor += command.armor
    //           queue.push({
    //             type: GameTransitions.BUFF_ARMOR,
    //             turn: gameState!.currentTurn,
    //             heroes: {
    //               [gameState!.currentTurn]: { ...playerHero },
    //             },
    //             duration: 100,
    //           })
    //         } else if (command.skill) {
    //           const preCommandHero = { ...playerHero }
    //           const preCommandOpponent = { ...opponentHero }
    //           playerHero.fireMp = command.hero.fireMp
    //           playerHero.windMp = command.hero.windMp
    //           playerHero.watrMp = command.hero.watrMp
    //           playerHero.eartMp = command.hero.eartMp

    //           queue.push({
    //             type: GameTransitions.CAST,
    //             turn: gameState!.currentTurn,
    //             spotlight: [gameState!.currentTurn],
    //             heroes: {
    //               [gameState!.currentTurn]: { ...playerHero },
    //             },
    //             skill: {
    //               lvl: command.lvl ?? 1,
    //               name: command.skill.name,
    //               type: command.skill.type,
    //             },
    //             nodes: matches.reduce((acc, cur, i) => {
    //               if (cur !== null) {
    //                 acc[i] = {
    //                   type: matches[i],
    //                 }
    //               }
    //               return acc
    //             }, {}),
    //             duration: 1500,
    //           })

    //           const postCommand = command.skill.fn({
    //             commandLevel: command.lvl ?? 1,
    //             player: playerHero,
    //             preCommandHero,
    //             opponent: opponentHero,
    //             tiles: newTiles,
    //             gameHash: hash,
    //           })

    //           playerHero = postCommand.player
    //           opponentHero = postCommand.opponent

    //           // do shuffle check
    //           if (newTiles !== postCommand.tiles) {
    //             const updateAll = hash !== postCommand.gameHash

    //             queue.push({
    //               type: GameTransitions.NODE_OUT,
    //               tiles: [...newTiles],
    //               nodes: newTiles.reduce((acc: any, cur, i) => {
    //                 if (
    //                   cur !== null &&
    //                   (updateAll || cur !== postCommand.tiles?.[i])
    //                 ) {
    //                   const x = i % 8
    //                   const y = Math.floor(i / 8)
    //                   acc[i] = {
    //                     delay: (x + y) * 50,
    //                   }
    //                 }
    //                 return acc
    //               }, {}),
    //               duration: 400,
    //             })

    //             queue.push({
    //               type: GameTransitions.NODE_IN,
    //               tiles: [...(postCommand.tiles ?? newTiles)],
    //               nodes: (postCommand.tiles ?? []).reduce(
    //                 (acc: any, cur, i) => {
    //                   if (cur !== null && (updateAll || cur !== newTiles[i])) {
    //                     const x = i % 8
    //                     const y = Math.floor(i / 8)
    //                     acc[i] = {
    //                       delay: (x + y) * 50,
    //                     }
    //                   }
    //                   return acc
    //                 },
    //                 {},
    //               ),
    //               duration: 400,
    //             })
    //           }

    //           hash = postCommand.gameHash ?? hash
    //           newTiles = postCommand.tiles ?? newTiles

    //           const spotlight: any = []
    //           const heroes: any = {}
    //           let type = GameTransitions.ATTACK_SPELL

    //           if (
    //             command.skill.target === TargetHero.SELF ||
    //             command.skill.target === TargetHero.BOTH
    //           ) {
    //             spotlight.push(gameState!.currentTurn)
    //             heroes[gameState!.currentTurn] = { ...playerHero }

    //             if (command.skill.type === SkillTypes.SUPPORT) {
    //               type = GameTransitions.BUFF_SPELL
    //             }
    //           }
    //           if (
    //             command.skill.target === TargetHero.ENEMY ||
    //             command.skill.target === TargetHero.BOTH
    //           ) {
    //             spotlight.push(opponentPubkey)
    //             heroes[opponentPubkey] = { ...opponentHero }
    //           }

    //           // const heroDmgAmt = preCommandHero.hp - playerHero.hp
    //           const opponentDmgAmt = preCommandOpponent.hp - opponentHero.hp

    //           // TODO: included BOTH
    //           let damage = null
    //           if (opponentDmgAmt > 0) {
    //             damage = { hero: opponentPubkey, amount: opponentDmgAmt }
    //           }

    //           queue.push({
    //             type,
    //             turn: gameState!.currentTurn,
    //             spotlight,
    //             // TODO: fade transition
    //             // tiles: [...newTiles],
    //             // nodes (check DRAIN)
    //             damage,
    //             heroes,
    //             duration: 100,
    //           })
    //         }
    //       })

    //       const { tiles, gravity } = applyGravity(newTiles, depths)
    //       newTiles = tiles

    //       hash = getNextHash([Buffer.from('REFILL'), hash])

    //       const fillers = hashToTiles(hash)

    //       newTiles = fill(newTiles, fillers, depths)

    //       queue.push({
    //         type: GameTransitions.FILL,
    //         turn: gameState.currentTurn,
    //         tiles: [...newTiles],
    //         nodes: matches.reduce((acc, _, i) => {
    //           if (gravity[i] !== null) {
    //             acc[i] = {
    //               from: {
    //                 x: i % 8,
    //                 y: Math.floor(i / 8) - gravity[i],
    //               },
    //             }
    //           }
    //           return acc
    //         }, {}),
    //         duration: 850,
    //       })
    //     }

    //     gameState.tiles = [...newTiles] as number[]
    //     gameState.hashes = [...gameState.hashes, bs58.encode(hash)]
    //     gameState.players = {
    //       [gameState.currentTurn]: playerHero,
    //       [opponentPubkey]: opponentHero,
    //     }

    //     // TODO
    //     // checkWinner(playerHero, opponentHero)
    //     const isMe = player.nft === gameState?.currentTurn

    //     if (gameState.hashes.length >= 0) {
    //       if (playerHero.hp > 0 && opponentHero.hp <= 0) {
    //         queue.push({
    //           type: isMe ? GameTransitions.WIN : GameTransitions.LOSE,
    //         })
    //       } else if (playerHero.hp <= 0 && opponentHero.hp > 0) {
    //         queue.push({
    //           type: isMe ? GameTransitions.LOSE : GameTransitions.WIN,
    //         })
    //       } else if (playerHero.hp <= 0 && opponentHero.hp <= 0) {
    //         queue.push({
    //           type: GameTransitions.DRAW,
    //         })
    //       }
    //     } else {
    //       if (playerHero.hp === opponentHero.hp) {
    //         queue.push({
    //           type: GameTransitions.DRAW,
    //         })
    //       } else if (playerHero.hp > opponentHero.hp) {
    //         queue.push({
    //           type: isMe ? GameTransitions.WIN : GameTransitions.LOSE,
    //         })
    //       } else if (playerHero.hp < opponentHero.hp) {
    //         queue.push({
    //           type: isMe ? GameTransitions.LOSE : GameTransitions.WIN,
    //         })
    //       }
    //     }

    //     queue.push({
    //       type: GameTransitions.SET,
    //       heroes: { ...gameState.players },
    //     })

    //     set(gameTransitionQueueAtom, [...queue])
    //     break
    //   }
    // }

    // const nextTurn = getNextTurn(
    //   playerHero,
    //   opponentHero,
    //   new PublicKey(gameState.currentTurn).toBytes(),
    //   new PublicKey(opponentPubkey).toBytes(),
    //   hash,
    // )

    // set(gameStateAtom, {
    //   ...gameState,
    //   currentTurn: bs58.encode(nextTurn.pubkey),
    // })
}
