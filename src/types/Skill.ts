import { SkillTypes } from '@/enums/SkillTypes'

export type Skill = (
  | {
      type: SkillTypes.ATTACK | SkillTypes.SUPPORT
      cmdLvls: string[]
    }
  | {
      type: SkillTypes.SPECIAL
    }
) & {
  name: string
  desc: string
  code: Uint8Array
}
