import { Hero } from './gameFunctions'

interface OperationArguments {
  commandLevel: number
  player: Hero
  opponent: Hero
  tiles: (number | null)[]
  gameHash: Uint8Array
  depths: number
}

interface OperationContext {
  code: number[]
  cursor: number
  current: {
    operationId: number
    operationVersion: number
    args: number[]
  } | null
  versions: { [key: number]: number }
  count: number
  skip: number
}

const propertyIdMap = {
  'player.hp': 1,
  'player.maxHp': 2,
  'player.maxMp': 3,
  'player.armor': 4,
  'player.shell': 5,
  'player.turnTime': 6,
  'player.baseDmg': 7,
  'player.weight': 8,
  'player.carryCap': 9,
  'player.fireMp': 10,
  'player.windMp': 11,
  'player.watrMp': 12,
  'player.eartMp': 13,
  'player.int': 14,
  'player.spd': 15,
  'player.vit': 16,
  'player.str': 17,
  'player.poison': 18,
  'player.poisonStack': 19,
  'player.envenom': 20,
  'player.regen': 21,
  'player.regenStack': 22,
  'player.reflect': 23,
  'player.haste': 24,
  'player.slow': 25,
  'player.sleep': 26,
  'player.silence': 27,
  'player.confusion': 28,
  'player.berserk': 29,
  'player.autoLife': 30,
  'player.trance': 31,
  'player.xTrance': 32,
  'opponent.hp': 33,
  'opponent.maxHp': 34,
  'opponent.maxMp': 35,
  'opponent.armor': 36,
  'opponent.shell': 37,
  'opponent.turnTime': 38,
  'opponent.baseDmg': 39,
  'opponent.weight': 40,
  'opponent.carryCap': 41,
  'opponent.fireMp': 42,
  'opponent.windMp': 43,
  'opponent.watrMp': 44,
  'opponent.eartMp': 45,
  'opponent.int': 46,
  'opponent.spd': 47,
  'opponent.vit': 48,
  'opponent.str': 49,
  'opponent.poison': 50,
  'opponent.poisonStack': 51,
  'opponent.envenom': 52,
  'opponent.regen': 53,
  'opponent.regenStack': 54,
  'opponent.reflect': 55,
  'opponent.haste': 56,
  'opponent.slow': 57,
  'opponent.sleep': 58,
  'opponent.silence': 59,
  'opponent.confusion': 60,
  'opponent.berserk': 61,
  'opponent.autoLife': 62,
  'opponent.trance': 63,
  'opponent.xTrance': 64,
  commandLevel: 65,
}

export const ops: {
  [key: number]: {
    len: number
    fn: (state: VariableMapper, context: OperationContext) => void
  }
} = {
  [1]: {
    len: 3,
    fn: (state: VariableMapper, context: OperationContext) => {
      // assign
      // VAR1 = any literal number
      const args = context.current!.args
      state.set(args[0], args[1])
    },
  },
  [2]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // skip
      // If VAR1 is truthy, skip the next OP
      const args = context.current!.args
      if (args[0] !== 0) {
        context.skip += 1
      }
    },
  },
  [3]: {
    len: 2,
    fn: (state: VariableMapper, context: OperationContext) => {
      // goto
      // Move cursor to specific index (index starting from the first operation)
      const args = context.current!.args
      context.cursor = args[0]
    },
  },
  [15]: {
    len: 1,
    fn: (state: VariableMapper, context: OperationContext) => {
      // end
      // Forcefully end the instruction
      context.cursor = 255
    },
  },
  [16]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // not equal
      // VAR1 = VAR2 != VAR3
      const args = context.current!.args
      state.set(args[0], state.get(args[1]) !== state.get(args[2]) ? 1 : 0)
    },
  },
  [17]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // equal
      // VAR1 = VAR2 == VAR3
      const args = context.current!.args
      state.set(args[0], state.get(args[1]) === state.get(args[2]) ? 1 : 0)
    },
  },
  [18]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // less than
      // VAR1 = VAR2 < VAR3
      const args = context.current!.args
      state.set(args[0], state.get(args[1]) < state.get(args[2]) ? 1 : 0)
    },
  },
  [19]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // less than or equal
      // VAR1 = VAR2 <= VAR3
      const args = context.current!.args
      state.set(args[0], state.get(args[1]) <= state.get(args[2]) ? 1 : 0)
    },
  },
  [32]: {
    len: 3,
    fn: (state: VariableMapper, context: OperationContext) => {
      // not
      // VAR1 = !VAR2
      const args = context.current!.args
      state.set(args[0], state.get(args[1]) === 0 ? 1 : 0)
    },
  },
  [33]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // or
      // VAR1 = VAR2 || VAR3
      const args = context.current!.args
      const var2 = state.get(args[1]) !== 0
      const var3 = state.get(args[2]) !== 0
      state.set(args[0], var2 || var3 ? 1 : 0)
    },
  },
  [34]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // and
      // VAR1 = VAR2 && VAR3
      const args = context.current!.args
      const var2 = state.get(args[1]) !== 0
      const var3 = state.get(args[2]) !== 0
      state.set(args[0], var2 && var3 ? 1 : 0)
    },
  },
  [48]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // add
      // VAR1 = VAR2 + VAR3, Note max value is 255
      const args = context.current!.args
      state.set(
        args[0],
        Math.max(Math.min(state.get(args[1]) + state.get(args[2]), 255), 0),
      )
    },
  },
  [49]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // subtract
      // VAR1 = VAR2 - VAR3, Note it cannot go down below 0
      const args = context.current!.args
      state.set(
        args[0],
        Math.max(Math.min(state.get(args[1]) - state.get(args[2]), 255), 0),
      )
    },
  },
  [50]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // multiply
      // VAR1 = VAR2 * VAR3, Note max value is 255
      const args = context.current!.args
      state.set(
        args[0],
        Math.max(
          Math.min(Math.floor(state.get(args[1]) * state.get(args[2])), 255),
          0,
        ),
      )
    },
  },
  [51]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // divide
      // VAR1 = VAR2 / VAR3, Note value is floored down (no floating pt)
      const args = context.current!.args

      // avoid division by 0
      if (args[2] === 0) {
        state.set(args[0], 0)
        return
      }

      state.set(
        args[0],
        Math.max(
          Math.min(Math.floor(state.get(args[1]) / state.get(args[2])), 255),
          0,
        ),
      )
    },
  },
  [52]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // modulo
      // VAR1 = VAR2 % VAR3
      const args = context.current!.args
      state.set(
        args[0],
        Math.max(
          Math.min(Math.floor(state.get(args[1]) % state.get(args[2])), 255),
          0,
        ),
      )
    },
  },
  [53]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // add (assign)
      // VAR1 += VAR2, Note max value is 255
      const args = context.current!.args
      state.set(
        args[0],
        Math.max(Math.min(state.get(args[0]) + state.get(args[1]), 255), 0),
      )
    },
  },
  [54]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // subtract (assign)
      // VAR1 -= VAR2, Note it cannot go down below 0
      const args = context.current!.args
      state.set(
        args[0],
        Math.max(Math.min(state.get(args[0]) - state.get(args[1]), 255), 0),
      )
    },
  },
  [55]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // multiply (assign)
      // VAR1 *= VAR2, Note max value is 255
      const args = context.current!.args
      state.set(
        args[0],
        Math.max(
          Math.min(Math.floor(state.get(args[0]) * state.get(args[1])), 255),
          0,
        ),
      )
    },
  },
  [56]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // divide (assign)
      // VAR1 /= VAR2, Note value is floored down (no floating pt)
      const args = context.current!.args

      // avoid division by 0
      if (args[1] === 0) {
        state.set(args[0], 0)
        return
      }

      state.set(
        args[0],
        Math.max(
          Math.min(Math.floor(state.get(args[0]) / state.get(args[1])), 255),
          0,
        ),
      )
    },
  },
  [57]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // modulo (assign)
      // VAR1 %= VAR2
      const args = context.current!.args
      state.set(
        args[0],
        Math.max(
          Math.min(Math.floor(state.get(args[0]) % state.get(args[1])), 255),
          0,
        ),
      )
    },
  },
  [64]: {
    len: 3,
    fn: (state: VariableMapper, context: OperationContext) => {
      // absolute
      // VAR1 = abs(VAR2)
      const args = context.current!.args
      switch (context.current!.operationVersion) {
        case 1: {
          state.set(args[0], Math.abs(state.get(args[1])))
          break
        }
      }
    },
  },
  [65]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // min
      // VAR1 = min(VAR2, VAR3)
      const args = context.current!.args
      switch (context.current!.operationVersion) {
        case 1: {
          state.set(args[0], Math.min(state.get(args[1]), state.get(args[2])))
          break
        }
      }
    },
  },
  [66]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // max
      // VAR1 = max(VAR2, VAR3)
      const args = context.current!.args
      switch (context.current!.operationVersion) {
        case 1: {
          state.set(args[0], Math.max(state.get(args[1]), state.get(args[2])))
          break
        }
      }
    },
  },
  [67]: {
    len: 5,
    fn: (state: VariableMapper, context: OperationContext) => {
      // damage
      // dmg(VAR1: hp, VAR2: shield, VAR3: damage amount, VAR4: is piercing)
      const args = context.current!.args
      switch (context.current!.operationVersion) {
        case 1: {
          if (state.get(args[3]) === 0) {
            if (state.get(args[1]) < state.get(args[2])) {
              state.set(
                args[2],
                Math.max(state.get(args[2]) - state.get(args[1]), 0),
              )
              state.set(args[1], 0)
            } else {
              state.set(
                args[1],
                Math.max(state.get(args[1]) - state.get(args[2]), 0),
              )
              state.set(args[2], 0)
            }
          }

          state.set(
            args[0],
            Math.max(state.get(args[0]) - state.get(args[2]), 0),
          )

          break
        }
      }
    },
  },
  [68]: {
    len: 3,
    fn: (state: VariableMapper, context: OperationContext) => {
      // heal
      // heal(VAR1: hp, VAR2: amount)
      const args = context.current!.args
      switch (context.current!.operationVersion) {
        case 1: {
          state.set(
            args[0],
            Math.min(state.get(args[1]), state.get(args[1] + 1)),
          )
          break
        }
      }
    },
  },
  [69]: {
    len: 3,
    fn: (state: VariableMapper, context: OperationContext) => {
      // buff / debuff
      // buff(VAR1: buff, VAR2 / NONE: duration) - if duration is present, force assign buff counter
      const args = context.current!.args
      switch (context.current!.operationVersion) {
        case 1: {
          // TODO: check reflect status
          switch (args[0]) {
            // 18	Poison
            // 19	Poison Damage Stack
            // Debuff ctr is affected by turns. Ctr resets if reapplied. DMG stacks indefinitely.
            // Subtract ctr from regen
            case 18:
            case 50: {
              break
            }

            // 20	Envenom
            // Buff ctr is affected by physical attacks. Ctr stacks if reapplied.
            case 20:
            case 52: {
              break
            }

            // 21	Regen
            // 22	Regen Heal Stack
            // Buff ctr is affected by turns. Ctr resets if reapplied. HP gain stacks indefinitely.
            // Subtract ctr from poison
            case 21:
            case 53: {
              break
            }

            // 23	Reflect
            // Buff ctr is used when triggered. Ctr stacks if reapplied.
            // Substract ctr from opponent's relfect ctr
            case 23:
            case 55: {
              break
            }

            // 24	Haste
            // Buff ctr is affected by turns. Ctr resets if reapplied.
            // Overrides Slow and Sleep
            case 24:
            case 56: {
              break
            }

            // 25	Slow
            // Debuff ctr is affected by turns. Ctr resets if reapplied.
            // Overrides Haste and Sleep
            case 25:
            case 57: {
              break
            }

            // 26	Sleep
            // Debuff ctr is affected by turns. Ctr resets if reapplied.
            // Overrides Haste and Slow
            case 26:
            case 58: {
              break
            }

            // 27	Silence
            // Debuff ctr is affected by turns. Ctr resets if reapplied.
            case 27:
            case 59: {
              break
            }

            // 28	Confusion
            // Debuff ctr is affected by turns. Ctr resets if reapplied.
            case 28:
            case 60: {
              break
            }

            // 29	Berserk
            // Buff ctr is affected by turns. Ctr resets if reapplied.
            // Overrides Trance and X-Trance
            case 29:
            case 61: {
              break
            }

            // 30	Auto-Life
            // Buff ctr is used when triggered. Ctr resets if reapplied.
            case 30:
            case 62: {
              break
            }

            // 31	Trance
            // Buff ctr is affected by turns. Ctr resets if reapplied.
            // Overrides Berserk and X-Trance
            case 31:
            case 63: {
              break
            }

            // 32	X-Trance
            // Buff ctr is affected by turns. Ctr resets if reapplied.
            // Overrides Berserk and Trance
            case 32:
            case 64: {
              break
            }
          }

          break
        }
      }
    },
  },
  [70]: {
    len: 1,
    fn: (state: VariableMapper, context: OperationContext) => {
      // shuffle
      // shuffle's the board
      const args = context.current!.args
      switch (context.current!.operationVersion) {
        case 1: {
          //
          break
        }
      }
    },
  },
  [71]: {
    len: 3,
    fn: (state: VariableMapper, context: OperationContext) => {
      // count symbols
      // VAR1 = count(LITERAL: symbol flags)
      const args = context.current!.args
      switch (context.current!.operationVersion) {
        case 1: {
          //
          break
        }
      }
    },
  },
}

function getPropertyPath(id: number) {
  const property = getPropertyById(id)
  return property.split('.')
}

function getPropertyById(id: number) {
  for (const [property, propertyId] of Object.entries(propertyIdMap)) {
    if (propertyId === id) {
      return property
    }
  }
  throw new Error(`Invalid property ID: ${id}`)
}

class VariableMapper {
  vars = Array.from(Array(55)).fill(0)
  constructor(public state: OperationArguments) {}

  set(id: number, value: number) {
    if (id >= 200) {
      this.vars[id - 200] = value
      return
    }

    const propertyPath = getPropertyPath(id)
    let obj: { [key: string]: any } = this.state
    for (let i = 0; i < propertyPath.length - 1; i++) {
      obj = obj[propertyPath[i]]
    }

    obj[propertyPath[propertyPath.length - 1]] = value
  }

  get(id: number) {
    if (id >= 200) {
      return this.vars[id - 200]
    }

    const propertyPath = getPropertyPath(id)
    let obj: { [key: string]: any } = this.state
    for (let i = 0; i < propertyPath.length - 1; i++) {
      obj = obj[propertyPath[i]]
    }

    return obj[propertyPath[propertyPath.length - 1]]
  }
}

export function parseSkillInstructionCode(
  args: OperationArguments,
  code: Uint8Array,
) {
  // [MANA     ] [O.V]    [OPERATIONS                             ]
  // 03 00 00 00 43 01 00 01 D0 03 37 D0 42 35 D0 07 43 21 25 D0 00

  // shortest code is 8 bytes
  if (code.length < 8) {
    throw new Error('Code size is invalid')
  }

  const context: OperationContext = {
    cursor: 0,
    code: Array.from(code),
    current: null,
    versions: {},
    count: 0,
    skip: 0,
  }

  // extract operation versions
  let ctr = 0
  while (ctr < 255) {
    const idx = code[ctr * 2 + 4]
    if (idx === 0) break
    if (!ops[idx]) {
      throw new Error(`Operation with ID ${idx} does not exists`)
    }

    context.versions[idx] = code[idx + 1]
    ctr += 1
  }

  if (ctr === 256) {
    throw new Error('Failed to terminate operation version extraction')
  }

  const opStartIndex = ctr * 2 + 5

  const map = new VariableMapper(args)

  while (
    context.count < 255 &&
    context.cursor < 255 &&
    opStartIndex + context.cursor < context.code.length
  ) {
    const opId = context.code[context.cursor]

    if (opId >= 64) {
      // check if operation version exists
      if (!context.versions[opId]) {
        throw new Error(
          `Operation with ID ${opId} is invalid, cursor at ${context.cursor}`,
        )
      }
    }

    // check if there are enough arguments
    const opLen = ops[opId].len
    if (opStartIndex + context.cursor + opLen > context.code.length) {
      throw new Error(
        `Operation with ID ${opId} does not have enough arguments`,
      )
    }

    context.current = {
      operationId: opId,
      operationVersion: context.versions[opId] ?? 1,
      args: context.code.slice(
        opStartIndex + context.cursor + 1,
        opStartIndex + context.cursor + opLen,
      ),
    }

    if (context.skip > 0) {
      context.skip -= 1
      context.cursor += opLen
    } else {
      ops[opId].fn(map, context)
      // move cursor to next op except for goto and end operations
      if (opId !== 3 && opId !== 15) {
        context.cursor += opLen
      }
    }

    context.count += 1
  }
}
