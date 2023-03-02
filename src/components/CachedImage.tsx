'use client'

import { cachedImageAtom } from '@/atoms/cachedImageAtom'
import { useAtomValue } from 'jotai'
import {
  DetailedHTMLProps,
  FC,
  ImgHTMLAttributes,
  useEffect,
  useRef,
} from 'react'
import { ErrorBoundary } from './ErrorBoundary'

export const CachedImageRaw: FC<
  DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>
> = ({ src, ...props }) => {
  const blob = useAtomValue(cachedImageAtom(src + ''))
  const ref = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const render = ref.current

    if (render && !blob) {
      render.src = src!
    } else if (render && blob) {
      render.src = URL.createObjectURL(blob)

      const onLoad = (e: any) => {
        if (e.target?.src) {
          URL.revokeObjectURL(e.target.src)
        }
      }

      const onError = (e: any) => {
        if (e.target?.src) {
          URL.revokeObjectURL(e.target.src)
        }
      }

      render.addEventListener('load', onLoad)
      render.addEventListener('error', onError)

      return () => {
        render.removeEventListener('load', onLoad)
        render.removeEventListener('error', onError)
      }
    }
  }, [blob])

  return <img ref={ref} {...props} />
}

export const CachedImage: FC<
  DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>
> = (props) => {
  return (
    <ErrorBoundary fallback={<img {...props} />}>
      <CachedImageRaw {...props} />
    </ErrorBoundary>
  )
}
