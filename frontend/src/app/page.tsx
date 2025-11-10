import Tasks from './components/goals/page'

export default function Home() {
  return (
    <div className="flex w-full justify-center bg-gray-100">
      <main className="flex min-h-screen w-full flex-col items-center justify-between bg-white px-16 sm:items-start">
        <Tasks />
      </main>
    </div>
  )
}
