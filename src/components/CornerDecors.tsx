import classNames from 'classnames'

export interface CornerDecorsProps {
  className?: string
  left?: boolean
  right?: boolean
}

export default function CornerDecors({
  className,
  left,
  right,
}: CornerDecorsProps) {
  return (
    <>
      {left !== false && (
        <div
          className={classNames(
            'absolute -top-px -left-px border-t-2 border-l-2 border-amber-400/50 pointer-events-none',
            className ?? 'w-2 h-2',
          )}
        />
      )}
      {right !== false && (
        <div
          className={classNames(
            'absolute -top-px -right-px border-t-2 border-r-2 border-amber-400/50 pointer-events-none',
            className ?? 'w-2 h-2',
          )}
        />
      )}
      {left !== false && (
        <div
          className={classNames(
            'absolute -bottom-px -left-px border-b-2 border-l-2 border-amber-400/50 pointer-events-none',
            className ?? 'w-2 h-2',
          )}
        />
      )}
      {right !== false && (
        <div
          className={classNames(
            'absolute -bottom-px -right-px border-b-2 border-r-2 border-amber-400/50 pointer-events-none',
            className ?? 'w-2 h-2',
          )}
        />
      )}
    </>
  )
}
