import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to Dan's Sandbox</h1>

        <div className="space-y-4">
          <Link
            href="/stats"
            className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-center transition-colors"
          >
            Stats Dashboard
          </Link>

          <Link
            href="/yahoo-auth-test"
            className="block w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md text-center transition-colors"
          >
            Yahoo Auth Test
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-6 text-center">Choose a destination above to explore the site</p>
      </div>
    </div>
  )
}
