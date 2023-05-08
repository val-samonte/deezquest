import classNames from 'classnames'
import { atom, useAtom } from 'jotai'

export interface MainMenuItemProps {
  link: string
  maskImg: string
  bgImg: string
}

export const hoveredAtom = atom('')

export default function MainMenuItem({
  link,
  bgImg,
  maskImg,
}: MainMenuItemProps) {
  const [hovered, setHovered] = useAtom(hoveredAtom)

  return (
    <div
      className={classNames(
        hovered && hovered !== link && 'grayscale brightness-50',
        hovered && hovered === link && 'scale-110 relative z-10',
        'w-[25vh] h-full flex items-center justify-center pointer-events-none transition-all duration-500 ',
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
    </div>
  )
}
