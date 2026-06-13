import { RefreshCw } from "lucide-react"

export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Admin Panel</h2>
        <p className="text-gray-600">Please wait while we load your dashboard...</p>
      </div>
    </div>
  )
}
