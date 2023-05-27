import CornerDecors from '@/components/CornerDecors'
import Panel from '@/components/Panel'
import classNames from 'classnames'

// const mask =
//   'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 3%, rgba(0,0,0,1) 97%, rgba(0,0,0,0) 100%)'

export default function Loadout() {
  return (
    <>
      <div className='flex-auto flex flex-col gap-5'>
        <div className='flex-auto flex items-stretch relative'>
          <div className='flex-none w-10 border-y border-l border-amber-400/50' />
          <div
            className='flex-auto -mx-10 p-5 relative flex flex-wrap justify-center items-start gap-3 xl:gap-5'
            // style={{
            //   WebkitMaskImage: mask,
            //   maskImage: mask,
            // }}
          >
            <div className='w-40 xl:w-60 aspect-[3/4] pointer-events-none'>
              <Panel
                title='Unarmed'
                className={classNames(
                  'transition-all duration-300',
                  // selected ? 'bg-indigo-700/50' : 'bg-black/50',
                  'w-40 xl:w-60 aspect-[3/4] ',
                )}
              >
                <div className='w-full aspect-square border-b border-amber-400/20'></div>
              </Panel>
            </div>
          </div>
          <div className='flex-none w-10 border-y border-r border-amber-400/50' />
          <CornerDecors className='w-6 h-6' />
        </div>
        <ul
          className={classNames(
            'flex items-center justify-center py-2',
            'uppercase tracking-widest font-bold',
          )}
        >
          <li className='h-2 w-2 border-b border-l border-amber-400/50 rotate-45' />
          <li className='h-4 w-4 border-b-2 border-l-2 border-amber-400/50 rotate-45' />
          <li className='mx-1' />
          <li className='opacity-100'>Weapon</li>
          <li className='h-2 w-2 border mx-3 border-amber-400/50 rotate-45' />
          <li className='opacity-20'>Armor</li>
          <li className='h-2 w-2 border mx-3 border-amber-400/50 rotate-45' />
          <li className='opacity-20'>Accessory</li>
          <li className='h-2 w-2 border mx-3 border-amber-400/50 rotate-45' />
          <li className='opacity-20'>Items</li>
          <li className='mx-1' />
          <li className='h-4 w-4 border-t-2 border-r-2 border-amber-400/50 rotate-45' />
          <li className='h-2 w-2 border-t border-r border-amber-400/50 rotate-45' />
        </ul>
      </div>
      <div className='w-96'>
        <Panel title='Weapon Details'>
          <></>
        </Panel>
      </div>
    </>
  )
}
