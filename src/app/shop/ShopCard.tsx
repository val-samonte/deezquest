'use client'

import classNames from 'classnames'

interface ShopCardProps {
  onClick: () => void
}

export function ShopCard({ onClick }: ShopCardProps) {
  return (
    <div
      className={classNames(
        'w-40 xl:w-60 aspect-[3/4] bg-white/10',
        'relative rounded overflow-hidden',
        'flex flex-col items-center',
      )}
      onClick={onClick}
    >
      <img
        className='h-full object-cover'
        src='https://shdw-drive.genesysgo.net/52zh6ZjiUQ5UKCwLBwob2k1BC3KF2qhvsE7V4e8g2pmD/SolanaSpaceman.png'
      />
    </div>
  )
}
