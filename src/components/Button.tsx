import classNames from 'classnames'
import { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from 'react'

export interface ButtonProps
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  children: ReactNode
}

export default function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      type='button'
      className={classNames(
        'px-5 py-2 border-y transition-all uppercase text-sm tracking-widest font-bold',
        'bg-black/25 px-5 border-amber-400/50 text-neutral-400',
        'hover:bg-amber-500/25 hover:border-amber-400 hover:text-white',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
