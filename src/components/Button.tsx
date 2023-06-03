import classNames from 'classnames'
import Link from 'next/link'
import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  ReactNode,
  useMemo,
} from 'react'

export interface ButtonProps
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  href?: string
  children: ReactNode
}

export default function Button({ children, className, ...props }: ButtonProps) {
  const Component: any = useMemo(
    () => (props.href ? Link : 'button'),
    [props.href],
  )

  return (
    <Component
      type='button'
      className={classNames(
        'px-5 py-2 border-y transition-all uppercase text-sm tracking-widest font-bold',
        'bg-black/25 px-5 border-amber-400/50 text-stone-500',
        'hover:bg-amber-500/25 hover:border-amber-400 hover:text-white',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
