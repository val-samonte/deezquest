import Link from 'next/link'

export default function TutorialContentPage() {
  return (
    <div className='absolute inset-0 flex flex-col items-center justify-center'>
      <div className='relative flex flex-col items-center justify-center gap-5 p-5'>
        <p className='text-center sm:text-lg xl:text-xl'>
          Our master is not yet home
        </p>
        <Link
          href='/barracks'
          className='px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded'
        >
          Head back to barracks
        </Link>
      </div>
    </div>
  )
}