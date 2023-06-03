import {
  barracksPathFlagsAtom,
  selectedHeroAtom,
  selectedHeroSkillsAtom,
  selectedNftAtom,
} from '@/atoms/barracksAtoms'
import AttributesDisplay from '@/components/AttributesDisplay'
import { HeroSkillDisplay } from '@/components/HeroSkillDisplay'
import Panel from '@/components/Panel'
import SpinnerIcon from '@/components/SpinnerIcon'
import { SkillTypes } from '@/enums/SkillTypes'
import classNames from 'classnames'
import { useAtomValue } from 'jotai'
import { IM_Fell_DW_Pica } from 'next/font/google'
import { useRouter } from 'next/navigation'

const font = IM_Fell_DW_Pica({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

const mask =
  'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 97.5%, rgba(0,0,0,0) 100%)'

export default function HeroPreview({ className }: { className?: string }) {
  const router = useRouter()
  const selected = useAtomValue(selectedNftAtom)
  const { level1, loadout, weapon, armor, accessory, items } = useAtomValue(
    barracksPathFlagsAtom,
  )

  const hero = useAtomValue(selectedHeroAtom)
  const skills = useAtomValue(selectedHeroSkillsAtom)

  if (!selected || !hero || !skills) return null

  return (
    <div className='h-full flex flex-col relative pointer-events-auto max-w-sm mx-auto'>
      <div
        className={classNames(
          'h-full overflow-y-scroll overflow-x-hidden absolute inset-0 p-5',
          className,
        )}
        style={{
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      >
        <div className='ltr w-full aspect-square landscape:hidden landscape:lg:block'>
          <Panel className='bg-amber-400/20 rounded-b-none'>
            {selected.metadata?.image ? (
              <img
                alt={selected.metadata.name ?? 'Unknown'}
                src={selected.metadata.image}
                className='object-cover w-full aspect-square'
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center'>
                <SpinnerIcon />
              </div>
            )}
          </Panel>
        </div>

        <div className='ltr sticky -top-5 z-10 w-full'>
          <h2 className='text-left px-5 py-2 transition-colors bg-black backdrop-grayscale flex items-center justify-between w-full'>
            <div
              className={classNames(
                'text-2xl overflow-hidden w-48 whitespace-nowrap overflow-ellipsis',
                font.className,
              )}
            >
              {selected.metadata.name}
            </div>
            <div className='text-sm tracking-widest flex items-center justify-center whitespace-nowrap'>
              <span className='uppercase'>Unregistered</span>
              {/* Lv&nbsp;<span className='font-bold'>32</span> */}
            </div>
          </h2>
          <div className='h-1 w-full mb-2 bg-gradient-to-r from-amber-400/50 to-amber-400/0' />
        </div>

        <div className='ltr max-w-sm mx-auto'>
          <AttributesDisplay hero={hero} />
        </div>

        {skills && (
          <div className='ltr flex flex-col gap-3 mt-5'>
            <HeroSkillDisplay
              onClick={() =>
                level1 &&
                router.push(`/heroes/${selected.address}/weapon/nothing`)
              }
              skill={skills[SkillTypes.ATTACK]}
              className={classNames(
                'transition-all duration-300',
                loadout && !weapon && !items ? 'opacity-20' : 'opacity-100',
              )}
            >
              <div className='pl-2 flex justify-between text-neutral-400 pr-5'>
                <span>Unarmed</span>
                <span>0</span>
              </div>
            </HeroSkillDisplay>
            <HeroSkillDisplay
              onClick={() =>
                level1 &&
                router.push(`/heroes/${selected.address}/armor/nothing`)
              }
              skill={skills[SkillTypes.SUPPORT]}
              className={classNames(
                'transition-all duration-300',
                loadout && !armor && !items ? 'opacity-20' : 'opacity-100',
              )}
            >
              <div className='pl-2 flex justify-between text-neutral-400 pr-5'>
                <span>No Armor</span>
                <span>0</span>
              </div>
            </HeroSkillDisplay>
            <HeroSkillDisplay
              onClick={() =>
                level1 &&
                router.push(`/heroes/${selected.address}/accessory/nothing`)
              }
              skill={skills[SkillTypes.SPECIAL]}
              className={classNames(
                'transition-all duration-300',
                loadout && !accessory && !items ? 'opacity-20' : 'opacity-100',
              )}
            >
              <div className='pl-2 flex justify-between text-neutral-400 pr-5'>
                <span>No Accessory</span>
                <span>0</span>
              </div>
            </HeroSkillDisplay>
          </div>
        )}
      </div>
    </div>
  )
}
