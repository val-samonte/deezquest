import classNames from 'classnames'
import { atom, useAtom } from 'jotai'
import { IM_Fell_DW_Pica } from 'next/font/google'

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

  return (
    <div
      className={classNames(
        hovered && hovered !== link && 'grayscale brightness-50',
        hovered && hovered === link && 'scale-110 z-10',
        'w-[25vh] h-full flex items-center justify-center pointer-events-none transition-all duration-500 relative',
      )}
    >
      <div className='h-[25vh] aspect-[5/1]'>
        <div
          onMouseOver={() => setHovered(link)}
          className={classNames(
            hovered && hovered === link && 'scale-110',
            'relative h-full flex items-center justify-center -rotate-45 pointer-events-auto transition-all duration-500 cursor-pointer',
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
              hovered && hovered === link && 'scale-90',
              'absolute inset-x-0 w-full aspect-square rotate-45 pointer-events-none transition-all duration-500',
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
        }}
        className={classNames(
          hovered && hovered !== link && 'opacity-50',
          hovered && hovered === link && 'scale-150',
          'text-white absolute inset-0 flex items-center justify-center text-4xl transition-all duration-500',
          font.className,
        )}
      >
        {name}
      </div>
    </div>
  )
}
