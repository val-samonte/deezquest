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
  currentOperation: number[] | null
  opVersions: { [key: number]: number }
  loops: number
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
    },
  },
  [2]: {
    len: 2,
    fn: (state: VariableMapper, context: OperationContext) => {
      // go to
      // Move cursor to specific index, Note max goto and jump calls (loops) is 255
    },
  },
  [3]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // jump
      // If VAR1 is truthy, skip the next OP, Note max goto and jump calls (loops) is 255
    },
  },
  [15]: {
    len: 1,
    fn: (state: VariableMapper, context: OperationContext) => {
      // end
      // Forcefully end the instruction
    },
  },
  [16]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // not equal
      // VAR1 = VAR2 != VAR3
    },
  },
  [17]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // equal
      // VAR1 = VAR2 == VAR3
    },
  },
  [18]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // less than
      // VAR1 = VAR2 < VAR3
    },
  },
  [19]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // less than or equal
      // VAR1 = VAR2 <= VAR3
    },
  },
  [32]: {
    len: 3,
    fn: (state: VariableMapper, context: OperationContext) => {
      // not
      // VAR1 = !VAR2
    },
  },
  [33]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // or
      // VAR1 = VAR2 || VAR3
    },
  },
  [34]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // and
      // VAR1 = VAR2 && VAR3
    },
  },
  [48]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // add
      // VAR1 = VAR2 + VAR3, Note max value is 255
    },
  },
  [49]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // subtract
      // VAR1 = VAR2 - VAR3, Note it cannot go down below 0
    },
  },
  [50]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // multiply
      // VAR1 = VAR2 * VAR3, Note max value is 255
    },
  },
  [51]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // divide
      // VAR1 = VAR2 / VAR3, Note value is floored down (no floating pt)
    },
  },
  [52]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // modulo
      // VAR1 = VAR2 % VAR3
    },
  },
  [53]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // add (assign)
      // VAR1 += VAR2, Note max value is 255
    },
  },
  [54]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // subtract (assign)
      // VAR1 -= VAR2, Note it cannot go down below 0
    },
  },
  [55]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // multiply (assign)
      // VAR1 *= VAR2, Note max value is 255
    },
  },
  [56]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // divide (assign)
      // VAR1 /= VAR2, Note value is floored down (no floating pt)
    },
  },
  [57]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // modulo (assign)
      // VAR1 %= VAR2
    },
  },
  [64]: {
    len: 3,
    fn: (state: VariableMapper, context: OperationContext) => {
      // absolute
      // VAR1 = abs(VAR2)
    },
  },
  [65]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // min
      // VAR1 = min(VAR2, VAR3)
    },
  },
  [66]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // max
      // VAR1 = max(VAR2, VAR3)
    },
  },
  [67]: {
    len: 5,
    fn: (state: VariableMapper, context: OperationContext) => {
      // damage
      // dmg(VAR1: hp, VAR2: armor/shell, VAR3: dmg, VAR4: pierce)
    },
  },
  [68]: {
    len: 3,
    fn: (state: VariableMapper, context: OperationContext) => {
      // heal
      // heal(VAR1: hp, VAR2: amount)
    },
  },
  [69]: {
    len: 4,
    fn: (state: VariableMapper, context: OperationContext) => {
      // buff / debuff
      // buff(VAR1: buff, VAR2: duration, VAR3: amount (optional))
    },
  },
  [70]: {
    len: 1,
    fn: (state: VariableMapper, context: OperationContext) => {
      // shuffle
      // shuffle's the board
    },
  },
  [71]: {
    len: 3,
    fn: (state: VariableMapper, context: OperationContext) => {
      // replace
      // replace(VAR1: result count, VAR2: symbol flags)
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

export function skillInstructionCodeParser(
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
    currentOperation: null,
    opVersions: {},
    loops: 0,
    skip: 0,
  }

  // extract operation versions
  let ctr = 0
  while (true) {
    const idx = code[ctr * 2 + 4]
    if (idx === 0) break
    if (!ops[idx]) {
      throw new Error(`Operation with ID ${idx} does not exists`)
    }

    context.opVersions[idx] = code[idx + 1]
    ctr += 1
  }

  context.cursor = ctr * 2 + 5

  const map = new VariableMapper(args)
}
