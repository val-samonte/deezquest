import { SkillTypes } from '@/enums/SkillTypes'
import { Skill } from '@/types/Skill'

export default function CommandLevelsDescription({ skill }: { skill: Skill }) {
  return (
    <div className='flex flex-col mt-2 gap-1'>
      {skill.cmdLvls.map(
        (cmdLevelDesc, i) =>
          cmdLevelDesc && (
            <div className='flex items-center' key={i}>
              <div className='flex-none flex items-center p-1 bg-black/20 rounded'>
                <img
                  className='w-4 h-4 aspect-square'
                  src={`/sym_${
                    skill.type === SkillTypes.ATTACK
                      ? '0'
                      : skill.type === SkillTypes.SUPPORT
                      ? '1'
                      : '2'
                  }.png`}
                />
                <span className=''>{`×${i + 3}`}</span>
              </div>
              <div className='ml-2'>{cmdLevelDesc}</div>
            </div>
          ),
      )}
    </div>
  )
}
