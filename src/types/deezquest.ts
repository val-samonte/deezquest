export type Deezquest = {
  "version": "0.1.0",
  "name": "deezquest",
  "instructions": [
    {
      "name": "init",
      "accounts": [
        {
          "name": "main",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "deezCoin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "deezCoinMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programData",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "upgradeAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "InitParams"
          }
        }
      ]
    },
    {
      "name": "createSeason",
      "accounts": [
        {
          "name": "season",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "seasonRatingMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "main",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "CreateSeasonParams"
          }
        }
      ]
    },
    {
      "name": "registerSeason",
      "accounts": [
        {
          "name": "seasonRatingToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "seasonRatingMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "season",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "treasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "main",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createMatchEntry",
      "accounts": [
        {
          "name": "matchEntry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "seasonRatingToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "seasonRatingMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "season",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "burnerAccount",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "CreateMatchEntryParams"
          }
        }
      ]
    },
    {
      "name": "createGameHandler",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerMatchEntry",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "opponentMatchEntry",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "heroNft",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "heroNftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "burnerAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "docs": [
              "Bump nonce of the PDA. (1)"
            ],
            "type": "u8"
          },
          {
            "name": "authority",
            "docs": [
              "The burner account of the player."
            ],
            "type": "publicKey"
          },
          {
            "name": "playerHero",
            "docs": [
              "State of the player."
            ],
            "type": {
              "array": [
                "u8",
                22
              ]
            }
          },
          {
            "name": "opponentHero",
            "docs": [
              "State of the opponent."
            ],
            "type": {
              "array": [
                "u8",
                22
              ]
            }
          },
          {
            "name": "gameState",
            "docs": [
              "0 - not initialized, 1 - pending, 2 - win, 3 - lose, 4 - draw"
            ],
            "type": "u8"
          },
          {
            "name": "tiles",
            "docs": [
              "Representation of the board.",
              "TODO: this is wasteful, can be reduced to 3 bits per cell"
            ],
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "rootHash",
            "docs": [
              "Starting hash of the game.",
              "Should be the combination of hashes of the burner pubkeys."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "gameHash",
            "docs": [
              "Current hash of the game.",
              "Used for the \"randomness\" of the board."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "currentTurn",
            "docs": [
              "Mint address of the NFT who is currently allowed to make a move."
            ],
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "turns",
            "docs": [
              "Turns made by either player, capped at 100 turns.",
              "Reaching 100, the game should compare the HP of both players.",
              "Highest HP wins. If HP is the same, result is draw."
            ],
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          }
        ]
      }
    },
    {
      "name": "main",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "docs": [
              "Bump nonce of the PDA. (1)"
            ],
            "type": "u8"
          },
          {
            "name": "deezCoinBump",
            "docs": [
              "Bump nonce of the main game currency.",
              "DeezCoin is only obtainable when playing ranked games. (1)"
            ],
            "type": "u8"
          },
          {
            "name": "serviceFee",
            "docs": [
              "Small amount of fee being collected for services.",
              "Think of it as tax. (8)"
            ],
            "type": "u64"
          },
          {
            "name": "seasonCount",
            "docs": [
              "Counter to keep track the created seasons. (8)"
            ],
            "type": "u64"
          },
          {
            "name": "treasury",
            "docs": [
              "The wallet that stores the collected fees.",
              "Used for external services payment like hosting, rpc, maintainers salary, etc.",
              "At some point in time, this will be a PDA so that it will be managed by the program. (32)"
            ],
            "type": "publicKey"
          },
          {
            "name": "maintenanceAuthority",
            "docs": [
              "The authority that is permitted to do balancing and changes to the game mechanics itself.",
              "This is expected to be multisig / handled by the community. (32)"
            ],
            "type": "publicKey"
          },
          {
            "name": "superAuthority",
            "docs": [
              "The authority that is permitted to update this state.",
              "Intended to be unset at some point after making the program entirely immutable. (32)"
            ],
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "reserved",
            "docs": [
              "Unused reserved byte space for future additive changes. (128)"
            ],
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          }
        ]
      }
    },
    {
      "name": "matchEntry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "docs": [
              "Bump nonce of the PDA. (1)"
            ],
            "type": "u8"
          },
          {
            "name": "owner",
            "docs": [
              "Player who owns this PDA. (32)"
            ],
            "type": "publicKey"
          },
          {
            "name": "season",
            "docs": [
              "What season is this match for. (32)"
            ],
            "type": "publicKey"
          },
          {
            "name": "rating",
            "docs": [
              "We have to store the rating as well to offload some burden from the frontend. (8)"
            ],
            "type": "u64"
          },
          {
            "name": "burnerAccount",
            "docs": [
              "Burner account who is authorized to perform game related ix calls. (32)"
            ],
            "type": "publicKey"
          },
          {
            "name": "burnerNonce",
            "docs": [
              "Seed so that the player can retrieve the burner keypair regardless of device. (16)"
            ],
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "peerNonce",
            "docs": [
              "Seed used to get the peer ID of this owner for P2P communication. (16)"
            ],
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "codeChallenge",
            "docs": [
              "SHA 256 of code verifier, kept by the owner.",
              "If the owner decided to accept a match invitation,",
              "both are required to exchange their own code verifiers via P2P. (16)"
            ],
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "pairedMatch",
            "docs": [
              "Game PDA of the opponent who received the code verifier from the owner. (1 + 32)"
            ],
            "type": {
              "option": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "season",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "docs": [
              "Bump nonce of the PDA. (1)"
            ],
            "type": "u8"
          },
          {
            "name": "id",
            "docs": [
              "ID of this season, used for seed. (8)"
            ],
            "type": "u64"
          },
          {
            "name": "seasonRatingMintBump",
            "docs": [
              "Bump nonce of rating token for this season. (1)"
            ],
            "type": "u8"
          },
          {
            "name": "registeredPlayers",
            "docs": [
              "Counter to keep track of the registered players for this season.",
              "Can be possibly used as deez coin rewards multiplier (more players, more coins). (8)"
            ],
            "type": "u64"
          },
          {
            "name": "uri",
            "docs": [
              "Additional metadata for this season. (4 + varies)"
            ],
            "type": "string"
          },
          {
            "name": "reserved",
            "docs": [
              "Unused reserved byte space for future additive changes. (128)"
            ],
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "CreateSeasonParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "uri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "InitParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "maintenanceAuthority",
            "type": "publicKey"
          },
          {
            "name": "treasury",
            "type": "publicKey"
          },
          {
            "name": "serviceFee",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "CreateMatchEntryParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "burnerNonce",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "peerNonce",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "codeChallenge",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidDeezCoinMetadata",
      "msg": "Invalid deez coin metadata"
    }
  ]
};

export const IDL: Deezquest = {
  "version": "0.1.0",
  "name": "deezquest",
  "instructions": [
    {
      "name": "init",
      "accounts": [
        {
          "name": "main",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "deezCoin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "deezCoinMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programData",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "upgradeAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "InitParams"
          }
        }
      ]
    },
    {
      "name": "createSeason",
      "accounts": [
        {
          "name": "season",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "seasonRatingMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "main",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "CreateSeasonParams"
          }
        }
      ]
    },
    {
      "name": "registerSeason",
      "accounts": [
        {
          "name": "seasonRatingToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "seasonRatingMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "season",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "treasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "main",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createMatchEntry",
      "accounts": [
        {
          "name": "matchEntry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "seasonRatingToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "seasonRatingMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "season",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "burnerAccount",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "CreateMatchEntryParams"
          }
        }
      ]
    },
    {
      "name": "createGameHandler",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerMatchEntry",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "opponentMatchEntry",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "heroNft",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "heroNftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "burnerAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "docs": [
              "Bump nonce of the PDA. (1)"
            ],
            "type": "u8"
          },
          {
            "name": "authority",
            "docs": [
              "The burner account of the player."
            ],
            "type": "publicKey"
          },
          {
            "name": "playerHero",
            "docs": [
              "State of the player."
            ],
            "type": {
              "array": [
                "u8",
                22
              ]
            }
          },
          {
            "name": "opponentHero",
            "docs": [
              "State of the opponent."
            ],
            "type": {
              "array": [
                "u8",
                22
              ]
            }
          },
          {
            "name": "gameState",
            "docs": [
              "0 - not initialized, 1 - pending, 2 - win, 3 - lose, 4 - draw"
            ],
            "type": "u8"
          },
          {
            "name": "tiles",
            "docs": [
              "Representation of the board.",
              "TODO: this is wasteful, can be reduced to 3 bits per cell"
            ],
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "rootHash",
            "docs": [
              "Starting hash of the game.",
              "Should be the combination of hashes of the burner pubkeys."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "gameHash",
            "docs": [
              "Current hash of the game.",
              "Used for the \"randomness\" of the board."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "currentTurn",
            "docs": [
              "Mint address of the NFT who is currently allowed to make a move."
            ],
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "turns",
            "docs": [
              "Turns made by either player, capped at 100 turns.",
              "Reaching 100, the game should compare the HP of both players.",
              "Highest HP wins. If HP is the same, result is draw."
            ],
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          }
        ]
      }
    },
    {
      "name": "main",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "docs": [
              "Bump nonce of the PDA. (1)"
            ],
            "type": "u8"
          },
          {
            "name": "deezCoinBump",
            "docs": [
              "Bump nonce of the main game currency.",
              "DeezCoin is only obtainable when playing ranked games. (1)"
            ],
            "type": "u8"
          },
          {
            "name": "serviceFee",
            "docs": [
              "Small amount of fee being collected for services.",
              "Think of it as tax. (8)"
            ],
            "type": "u64"
          },
          {
            "name": "seasonCount",
            "docs": [
              "Counter to keep track the created seasons. (8)"
            ],
            "type": "u64"
          },
          {
            "name": "treasury",
            "docs": [
              "The wallet that stores the collected fees.",
              "Used for external services payment like hosting, rpc, maintainers salary, etc.",
              "At some point in time, this will be a PDA so that it will be managed by the program. (32)"
            ],
            "type": "publicKey"
          },
          {
            "name": "maintenanceAuthority",
            "docs": [
              "The authority that is permitted to do balancing and changes to the game mechanics itself.",
              "This is expected to be multisig / handled by the community. (32)"
            ],
            "type": "publicKey"
          },
          {
            "name": "superAuthority",
            "docs": [
              "The authority that is permitted to update this state.",
              "Intended to be unset at some point after making the program entirely immutable. (32)"
            ],
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "reserved",
            "docs": [
              "Unused reserved byte space for future additive changes. (128)"
            ],
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          }
        ]
      }
    },
    {
      "name": "matchEntry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "docs": [
              "Bump nonce of the PDA. (1)"
            ],
            "type": "u8"
          },
          {
            "name": "owner",
            "docs": [
              "Player who owns this PDA. (32)"
            ],
            "type": "publicKey"
          },
          {
            "name": "season",
            "docs": [
              "What season is this match for. (32)"
            ],
            "type": "publicKey"
          },
          {
            "name": "rating",
            "docs": [
              "We have to store the rating as well to offload some burden from the frontend. (8)"
            ],
            "type": "u64"
          },
          {
            "name": "burnerAccount",
            "docs": [
              "Burner account who is authorized to perform game related ix calls. (32)"
            ],
            "type": "publicKey"
          },
          {
            "name": "burnerNonce",
            "docs": [
              "Seed so that the player can retrieve the burner keypair regardless of device. (16)"
            ],
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "peerNonce",
            "docs": [
              "Seed used to get the peer ID of this owner for P2P communication. (16)"
            ],
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "codeChallenge",
            "docs": [
              "SHA 256 of code verifier, kept by the owner.",
              "If the owner decided to accept a match invitation,",
              "both are required to exchange their own code verifiers via P2P. (16)"
            ],
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "pairedMatch",
            "docs": [
              "Game PDA of the opponent who received the code verifier from the owner. (1 + 32)"
            ],
            "type": {
              "option": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "season",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "docs": [
              "Bump nonce of the PDA. (1)"
            ],
            "type": "u8"
          },
          {
            "name": "id",
            "docs": [
              "ID of this season, used for seed. (8)"
            ],
            "type": "u64"
          },
          {
            "name": "seasonRatingMintBump",
            "docs": [
              "Bump nonce of rating token for this season. (1)"
            ],
            "type": "u8"
          },
          {
            "name": "registeredPlayers",
            "docs": [
              "Counter to keep track of the registered players for this season.",
              "Can be possibly used as deez coin rewards multiplier (more players, more coins). (8)"
            ],
            "type": "u64"
          },
          {
            "name": "uri",
            "docs": [
              "Additional metadata for this season. (4 + varies)"
            ],
            "type": "string"
          },
          {
            "name": "reserved",
            "docs": [
              "Unused reserved byte space for future additive changes. (128)"
            ],
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "CreateSeasonParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "uri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "InitParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "maintenanceAuthority",
            "type": "publicKey"
          },
          {
            "name": "treasury",
            "type": "publicKey"
          },
          {
            "name": "serviceFee",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "CreateMatchEntryParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "burnerNonce",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "peerNonce",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "codeChallenge",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidDeezCoinMetadata",
      "msg": "Invalid deez coin metadata"
    }
  ]
};
