import classNames from 'classnames'
import { atom, useAtom, useSetAtom } from 'jotai'
import { IM_Fell_DW_Pica } from 'next/font/google'
import { useRouter } from 'next/navigation'
import { showMenuAtom } from './MainMenu'

const font = IM_Fell_DW_Pica({
  weight: '400',
  subsets: ['latin'],
})

// font.className

export interface MainMenuItemProps {
  name: string
  link: string
  maskImg: string
  bgImg: string
}

export const hoveredAtom = atom('')

export default function MainMenuItem({
  name,
  link,
  bgImg,
  maskImg,
}: MainMenuItemProps) {
  const [hovered, setHovered] = useAtom(hoveredAtom)
  const setShowMenu = useSetAtom(showMenuAtom)
  const router = useRouter()

  return (
    <div
      className={classNames(
        hovered && !hovered.includes(link) && 'grayscale',
        hovered && hovered.includes(link) && 'scale-110 z-10',
        'w-[14.5vw] h-full',
        'portrait:w-[14.75vh] h-full',
        'flex items-center justify-center pointer-events-none transition-all duration-500 relative',
      )}
    >
      <div
        className={classNames(
          !hovered && 'brightness-50',
          hovered && !hovered.includes(link) && 'brightness-50',
          'h-[14.5vw]',
          'portrait:h-[14.75vh]',
          'aspect-[5/1] transition-all duration-500',
        )}
      >
        <div
          onClick={() => {
            router.push(link)
            setShowMenu(false)
          }}
          onMouseOver={() => setHovered(link)}
          className={classNames(
            hovered && hovered.includes(link) && 'scale-110',
            'h-full',
            'relative flex items-center justify-center -rotate-45 pointer-events-auto transition-all duration-500 cursor-pointer',
          )}
          style={{
            WebkitMaskImage: `url("${maskImg}")`,
            maskImage: `url("${maskImg}")`,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
          }}
        >
          <div
            className={classNames(
              hovered && hovered.includes(link) && 'scale-75',
              'inset-x-0 w-full',
              'absolute aspect-square rotate-45 pointer-events-none transition-all duration-500',
            )}
            style={{
              backgroundImage: `url("${bgImg}")`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>
      </div>
      <div
        style={{
          WebkitFontSmoothing: 'antialised',
          textShadow: '0px -2px rgba(0,0,0,0.5)',
        }}
        className={classNames(
          hovered && !hovered.includes(link) && 'opacity-50',
          hovered && hovered.includes(link) && 'scale-150',
          'text-white absolute inset-0 flex items-center justify-center text-4xl transition-all duration-500',
          font.className,
        )}
      >
        <img
          className={classNames('h-8 xl:h-[3.5vh]', 'object-contain')}
          src={`/text_${name.toLowerCase()}.png`}
          alt={name}
        />
      </div>
    </div>
  )
}
