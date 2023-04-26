import { SkillTypes } from '@/enums/SkillTypes'

export type Skill = {
  type: SkillTypes
  cmdLvls: (string | undefined)[]
  name: string
  desc: string
  code: Uint8Array
}
