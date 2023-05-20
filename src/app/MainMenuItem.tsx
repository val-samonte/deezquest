import { hoveredAtom, showMenuAtom } from '@/atoms/menuAtom'
import classNames from 'classnames'
import { atom, useAtom, useSetAtom } from 'jotai'
import { IM_Fell_DW_Pica } from 'next/font/google'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const font = IM_Fell_DW_Pica({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

export interface MainMenuItemProps {
  alt?: string
  name: string
  link: string
  maskImg: string
  bgImg: string
  isRed?: boolean
  onSelect?: () => unknown
}

export default function MainMenuItem({
  alt,
  name,
  link,
  bgImg,
  maskImg,
  isRed,
  onSelect,
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
            if (onSelect) {
              onSelect()
            } else {
              router.push(link)
              setShowMenu(false)
            }
          }}
          onMouseOver={() => setHovered(link)}
          className={classNames(
            hovered && hovered.includes(link) && 'scale-110',
            'h-full',
            'relative flex items-center justify-center -rotate-45 pointer-events-auto transition-all duration-500 cursor-pointer',
          )}
          style={{
            WebkitMaskImage: `url("${process.env.NEXT_PUBLIC_CDN}${maskImg}")`,
            maskImage: `url("${process.env.NEXT_PUBLIC_CDN}${maskImg}")`,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
          }}
        >
          <div
            className={classNames(
              isRed && 'sepia',
              hovered && hovered.includes(link) && 'scale-75 contrast-125',
              'inset-x-0 w-full',
              'absolute aspect-square rotate-45 pointer-events-none transition-all duration-500',
            )}
            style={{
              backgroundImage: `url("${process.env.NEXT_PUBLIC_CDN}${bgImg}")`,
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
        {alt && (
          <Image
            className={classNames('h-8 xl:h-[3.5vh]', 'object-contain')}
            src={`${process.env.NEXT_PUBLIC_CDN}/text_${alt.toLowerCase()}.png`}
            alt={alt}
          />
        )}
        <Image
          className={classNames('h-8 xl:h-[3.5vh]', 'object-contain')}
          src={`${process.env.NEXT_PUBLIC_CDN}/text_${name.toLowerCase()}.png`}
          alt={name}
        />
      </div>
    </div>
  )
}
