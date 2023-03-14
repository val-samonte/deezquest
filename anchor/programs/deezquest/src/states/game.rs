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
            i += 1;
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
            i += 1;
        }

        panic!("Heroes are too identical, even having the same public key hash result.");
    } else if hero1.turn_time >= 200 {
        return (hero1, pubkey1);
    }

    (hero2, pubkey2)
}

pub fn hash_to_tiles(&hash: [u8; 32]) -> [Option<u8>; 64] {
    let mut tiles: [Option<u8>; 64] = [None; 64];
    let mut i = 0;
    while i < 32 {
        let byte = hash[i];

        tiles[i] = (byte * 0xf) % 7;
        tiles[i + 32] = ((byte >> 4) & 0xf) % 7;

        i += 1;
    }
    tiles
}

pub fn has_match(&tiles: [Option<u8>; 64]) -> bool {
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

pub fn get_matches(&tiles: [Option<u8>; 64]) -> ([Option<u8>; 64], [u8; 7], [u8; 8]) {
    let mut matches: [Option<u8>; 64] = [None; 64];
    let mut count: [u8; 7] = [0; 7];
    let mut depths: [u8; 8] = [0; 8];

    let mut i = 0;
    while i < 64 {
        let node_type = tiles[i];
        let col = i % 8;
        let row = i / 8;

        // vertical
        if row < 6 {
            if !node_type.is_none() && node_type == tiles[i + 8] && node_type == tiles[i + 16] {
                let node = node_type.unwrap();
                if matches[i]._is_none {
                    depths[col] += 1;
                    count[node] += 1;
                    matches[i] = node_type;
                }
                if matches[i + 8]._is_none {
                    depths[col] += 1;
                    count[node] += 1;
                    matches[i + 8] = node_type;
                }
                if matches[i + 16]._is_none {
                    depths[col] += 1;
                    count[node] += 1;
                    matches[i + 16] = node_type;
                }
            }
        }

        // horizontal
        if col < 6 {
            if !node_type.is_none() && node_type == tiles[i + 1] && node_type == tiles[i + 2] {
                let node = node_type.unwrap();
                if matches[i]._is_none {
                    depths[col] += 1;
                    count[node] += 1;
                    matches[i] = node_type;
                }
                if matches[i + 1]._is_none {
                    depths[col + 1] += 1;
                    count[node] += 1;
                    matches[i + 1] = node_type;
                }
                if matches[i + 2]._is_none {
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

pub fn substract(&tiles: [Option<u8>; 64], &mask: [Option<u8>; 64]) -> [Option<u8>; 64] {
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

pub fn apply_gravity(&mut tiles: [Option<u8>; 64], depths: [u8; 8]) -> [Option<u8>; 64] {
    let gravity_map: [Option<u8>; 64] = [None; 64];

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
                gravity_map[blanks[k]] = gravity
                    + match gravity_map[blanks[k]] {
                        Some(n) => n,
                        None => 0,
                    };

                k += 1;
            }

            blanks = Vec::new();

            let node_type = tiles[id];
            let dest = (j + gravity) * 8 + i;
            tiles[id] = None;
            tiles[dest] = Some(node_type);
            gravity_map[id] = Some(gravity);

            j -= 1;
        }

        let mut k = 0;
        while k < blanks.len() {
            gravity_map[blanks[k]] = gravity
                + match gravity_map[blanks[k]] {
                    Some(n) => n,
                    None => 0,
                };

            k += 1;
        }

        i += 1;
    }

    (gravity_map, tiles)
}

pub fn fill(
    &tiles: [Option<u8>; 64],
    &fillers: [Option<u8>; 64],
    &depths: [u8; 8],
) -> [Option<u8>; 64] {
    let mut i = 0;
    while i < 8 {
        if depths[i] == 0 {
            continue;
        }
        let mut j = 0;
        while j < depths[i] {
            let id = (j * 8) + i;
            tiles[id] = fillers[id];
            j += 1;
        }
        i += 1;
    }
    tiles
}

// export const skillCountPerMana = (mana: number[], cost: SkillCost) => {
//     const costs = [cost.fire, cost.wind, cost.water, cost.earth]

//     return mana.map((mp, i) => {
//       if (typeof costs[i] === 'undefined') return undefined

//       if (costs[i] === 0) {
//         return mp >= 1 ? 1 : 0
//       }

//       return mp / costs[i]!
//     })
//   }

//   export const isExecutable = (hero: Hero, cost: SkillCost) => {
//     const count = skillCountPerMana(
//       [hero.fireMp, hero.windMp, hero.watrMp, hero.eartMp],
//       cost,
//     )

//     return count.every((n) => {
//       if (typeof n === 'undefined') return true
//       if (n >= 1) return true

//       return false
//     })
//   }

//   export const deductMana = (hero: Hero, cost: SkillCost) => {
//     hero.fireMp -= cost.fire === 0 ? hero.fireMp : cost.fire ?? 0
//     hero.windMp -= cost.wind === 0 ? hero.windMp : cost.wind ?? 0
//     hero.watrMp -= cost.water === 0 ? hero.watrMp : cost.water ?? 0
//     hero.eartMp -= cost.earth === 0 ? hero.eartMp : cost.earth ?? 0

//     return hero
//   }

//   export const executableCommands = (
//     originalHero: Hero,
//     absorbedCommands: number[] /* [ATK, SUP, SPE] */,
//   ) => {
//     let hero = { ...originalHero } as Hero
//     const flags = [false, false, false]
//     const offensiveSkill = skills[hero.offensiveSkill]
//     const supportiveSkill = skills[hero.supportiveSkill]
//     const specialSkill = skills[hero.specialSkill]
//     const queue: {
//       hero: Hero
//       lvl?: number
//       skill?: Skill
//       attack?: number
//       armor?: number
//     }[] = []

//     // priority: special skill > supportive skill > offensive skill

//     // Special Skill requires to have 4 or more amulets to be executed
//     if (absorbedCommands[2] > 3) {
//       if (isExecutable(hero, specialSkill.cost)) {
//         hero = deductMana(hero, specialSkill.cost)
//         queue.push({
//           hero: { ...hero },
//           skill: specialSkill,
//         })
//         flags[2] = true
//       }
//     }

//     if (absorbedCommands[1] > 2) {
//       if (isExecutable(hero, supportiveSkill.cost)) {
//         hero = deductMana(hero, supportiveSkill.cost)
//         queue.push({
//           hero: { ...hero },
//           lvl: absorbedCommands[1] > 4 ? 3 : absorbedCommands[1] === 4 ? 2 : 1,
//           skill: supportiveSkill,
//         })
//         flags[1] = true
//       } else {
//         queue.push({
//           armor: absorbedCommands[1],
//           hero: { ...hero },
//         })
//       }
//     }

//     if (absorbedCommands[0] > 2) {
//       if (isExecutable(hero, offensiveSkill.cost)) {
//         hero = deductMana(hero, offensiveSkill.cost)
//         queue.push({
//           hero: { ...hero },
//           lvl: absorbedCommands[0] > 4 ? 3 : absorbedCommands[0] === 4 ? 2 : 1,
//           skill: offensiveSkill,
//         })
//         flags[0] = true
//       } else {
//         queue.push({
//           attack: absorbedCommands[0],
//           hero: { ...hero },
//         })
//       }
//     }

//     return {
//       flags,
//       queue,
//     }
//   }
