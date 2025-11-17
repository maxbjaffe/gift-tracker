// src/app/page.tsx - Family Hub Homepage

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Family Hub
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Your all-in-one platform for family management
          </p>
          <p className="text-lg text-gray-500">
            Track gifts and manage family accountability in one place
          </p>
        </div>

        {/* Two Main Systems - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Gift Tracker System */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-purple-200 hover:border-purple-400 transition-all">
            <div className="text-center mb-6">
              <div className="text-7xl mb-4">🎁</div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                Gift Tracker
              </h2>
              <p className="text-gray-600 text-lg">
                Never forget a gift idea again
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Track Recipients</h3>
                  <p className="text-gray-600 text-sm">Manage gift ideas for each person</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🛒</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Price Tracking</h3>
                  <p className="text-gray-600 text-sm">Find best prices automatically</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Suggestions</h3>
                  <p className="text-gray-600 text-sm">Personalized recommendations</p>
                </div>
              </div>
            </div>

            <a
              href="/dashboard"
              className="block w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg font-semibold text-center text-lg"
            >
              Open Gift Tracker →
            </a>
          </div>

          {/* Accountability System */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-blue-200 hover:border-blue-400 transition-all">
            <div className="text-center mb-6">
              <div className="text-7xl mb-4">🎯</div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
                Accountability
              </h2>
              <p className="text-gray-600 text-lg">
                Family accountability made simple
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🚫</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Consequences</h3>
                  <p className="text-gray-600 text-sm">Track restrictions and timeouts</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Commitments</h3>
                  <p className="text-gray-600 text-sm">Monitor chores and responsibilities</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">💬</span>
                <div>
                  <h3 className="font-semibold text-gray-900">SMS Control</h3>
                  <p className="text-gray-600 text-sm">Manage via text messages</p>
                </div>
              </div>
            </div>

            <a
              href="/accountability"
              className="block w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg font-semibold text-center text-lg"
            >
              Open Accountability →
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/recipients"
              className="p-4 text-center rounded-xl hover:bg-purple-50 transition-all border border-gray-200 hover:border-purple-300"
            >
              <div className="text-3xl mb-2">👥</div>
              <div className="text-sm font-medium text-gray-700">Recipients</div>
            </a>
            <a
              href="/gifts"
              className="p-4 text-center rounded-xl hover:bg-purple-50 transition-all border border-gray-200 hover:border-purple-300"
            >
              <div className="text-3xl mb-2">🎁</div>
              <div className="text-sm font-medium text-gray-700">Gifts</div>
            </a>
            <a
              href="/accountability"
              className="p-4 text-center rounded-xl hover:bg-blue-50 transition-all border border-gray-200 hover:border-blue-300"
            >
              <div className="text-3xl mb-2">📋</div>
              <div className="text-sm font-medium text-gray-700">Dashboard</div>
            </a>
            <a
              href="/accountability/analytics"
              className="p-4 text-center rounded-xl hover:bg-blue-50 transition-all border border-gray-200 hover:border-blue-300"
            >
              <div className="text-3xl mb-2">📊</div>
              <div className="text-sm font-medium text-gray-700">Analytics</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}