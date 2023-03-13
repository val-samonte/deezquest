use anchor_lang::prelude::*;

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
    pub fn from(serialized: [u8; 22]) -> Hero {
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
}

pub fn get_hero_attributes(pubkey: Pubkey) -> Hero {
    Hero {}
}

// export const getHeroAttributes = (pubkey: PublicKey) => {
//     let attribs = [
//         1, // INT - Mana cap increase
//         1, // SPD - More likely to get a turn
//         1, // VIT - Flat HP increase
//         1, // STR - Able to carry heavier equipment
//     ]
//     let cursor = 0
//     let remaining = 17
//     let bytes = pubkey.toBytes()

//     for (let i = 0; i < 256 && remaining > 0; i++) {
//         if (bytes[i % 32] % 2 === 0 || attribs[cursor] === 10) {
//         cursor = (cursor + 1) % 4
//         } else {
//         attribs[cursor] += 1
//         remaining -= 1
//         }
//     }

//     // very unlikely to happen
//     if (remaining !== 0) {
//         attribs = [5, 5, 5, 5]
//         attribs[bytes[0] % 4] += 1
//     }

//     return attribs
//     }

//     export const heroFromPublicKey = (publicKey: string | PublicKey): Hero => {
//     if (typeof publicKey === 'string') {
//         publicKey = new PublicKey(publicKey)
//     }

//     const [int, spd, vit, str] = getHeroAttributes(publicKey)
//     const bytes = publicKey.toBytes()

//     return {
//         hp: 80 + vit * 2,
//         hpCap: 80 + vit * 2,
//         armor: 0,
//         shell: 0,
//         turnTime: 0,
//         baseDmg: str,
//         fireMp: 0,
//         fireMpCap: 10 + int,
//         windMp: 0,
//         windMpCap: 10 + int,
//         watrMp: 0,
//         watrMpCap: 10 + int,
//         eartMp: 0,
//         eartMpCap: 10 + int,
//         int: int,
//         spd: spd,
//         vit: vit,
//         str: str,
//         weight: 0,
//         offensiveSkill: bytes[0] % 4,
//         supportiveSkill: (bytes[1] % 4) + 4,
//         specialSkill: (bytes[2] % 4) + 8,
//     }
//     }

//     export const applyDamage = (
//     hero: Hero,
//     physical = 0,
//     magical = 0,
//     ignoreArmor = false,
//     ignoreShell = false,
//     ) => {
//     if (!ignoreArmor) {
//         if (hero.armor < physical) {
//         physical -= hero.armor
//         hero.armor = 0
//         } else {
//         hero.armor -= physical
//         physical = 0
//         }
//     }

//     if (!ignoreShell) {
//         if (hero.shell < magical) {
//         magical -= hero.shell
//         hero.shell = 0
//         } else {
//         hero.shell -= magical
//         magical = 0
//         }
//     }

//     hero.hp -= physical + magical

//     return hero
//     }

//     export const addHp = (hero: Hero, amount: number) => {
//     hero.hp += amount
//     if (hero.hp > hero.hpCap) hero.hp = hero.hpCap
//     return hero
//     }

//     export const absorbMana = (
//     hero: Hero,
//     absorbedMana: number[] /* [FIRE, WIND, WATR, EART] */,
//     ) => {
//     hero.fireMp += absorbedMana[0]
//     hero.windMp += absorbedMana[1]
//     hero.watrMp += absorbedMana[2]
//     hero.eartMp += absorbedMana[3]

//     if (hero.fireMp > hero.fireMpCap) hero.fireMp = hero.fireMpCap
//     if (hero.windMp > hero.windMpCap) hero.windMp = hero.windMpCap
//     if (hero.watrMp > hero.watrMpCap) hero.watrMp = hero.watrMpCap
//     if (hero.eartMp > hero.eartMpCap) hero.eartMp = hero.eartMpCap

//     return hero
//     }

//     export const getNextTurn = (
//     hero1: Hero,
//     hero2: Hero,
//     pubkey1: Uint8Array,
//     pubkey2: Uint8Array,
//     gameHash: Uint8Array,
//     ) => {
//     while (hero1.turnTime < 200 && hero2.turnTime < 200) {
//         hero1.turnTime += hero1.spd + 5
//         hero2.turnTime += hero2.spd + 5
//     }

//     if (hero1.turnTime >= 200 && hero2.turnTime >= 200) {
//         const seq1 = [
//         hero1.turnTime,
//         hero1.spd,
//         hero1.vit,
//         hero1.str,
//         hero1.int,
//         hero1.hp,
//         ...Array.from(
//             crypto
//             .createHash('sha256')
//             .update(Buffer.concat([pubkey1, gameHash]))
//             .digest(),
//         ),
//         ]
//         const seq2 = [
//         hero2.turnTime,
//         hero2.spd,
//         hero2.vit,
//         hero2.str,
//         hero2.int,
//         hero2.hp,
//         ...Array.from(
//             crypto
//             .createHash('sha256')
//             .update(Buffer.concat([pubkey2, gameHash]))
//             .digest(),
//         ),
//         ]

//         for (let i = 0; i < seq1.length; i++) {
//         if (seq1[i] > seq2[i]) {
//             return { hero: hero1, pubkey: pubkey1 }
//         } else if (seq1[i] < seq2[i]) {
//             return { hero: hero2, pubkey: pubkey2 }
//         }
//         }

//         // shouldn't reach this point, unless both hero 1 and hero 2 are the same
//         throw new Error(
//         'Heroes are too identical, even having the same public key hash result.',
//         )
//     } else if (hero1.turnTime >= 200) {
//         return { hero: hero1, pubkey: pubkey1 }
//     }

//     return { hero: hero2, pubkey: pubkey2 }
//     }
