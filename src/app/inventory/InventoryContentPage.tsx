import Link from 'next/link'

export default function InventoryContentPage() {
  return (
    <div className='absolute inset-0 flex flex-col items-center justify-center'>
      <div className='relative flex flex-col items-center justify-center gap-5 p-5'>
        <p className='text-center sm:text-lg xl:text-xl'>
          Your inventory is empty
        </p>
        <Link
          href='/shop'
          className='px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded'
        >
          Check out shop
        </Link>
      </div>
    </div>
  )

  /* 
  return (
    <div className='w-screen sm:w-auto flex-auto overflow-y-auto overflow-x-hidden p-3 xl:p-5'>
      <div className='flex flex-wrap justify-center gap-3 xl:gap-5'>
        <InventoryCard onClick={() => router.push(sub)} />
        <InventoryCard onClick={() => router.push(sub)} />
        <InventoryCard onClick={() => router.push(sub)} />
        <InventoryCard onClick={() => router.push(sub)} />
        <InventoryCard onClick={() => router.push(sub)} />
        <InventoryCard onClick={() => router.push(sub)} />
        <InventoryCard onClick={() => router.push(sub)} />
        <InventoryCard onClick={() => router.push(sub)} /> 
      </div>
    </div>
  )
  */
}
