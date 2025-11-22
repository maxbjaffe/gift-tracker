// Family Hub Homepage Component
import Image from 'next/image'

export function FamilyHubHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50 py-12 px-4">
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
            Track gifts, manage accountability, and monitor school emails in one place
          </p>
        </div>

        {/* Three Main Systems */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* GiftStash System */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-orange-200 hover:border-giftstash-orange transition-all">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <Image
                  src="/images/GiftStashIconGSv2.png"
                  alt="GiftStash"
                  width={160}
                  height={160}
                  className="w-40 h-40"
                />
              </div>
              <Image
                src="/images/GiftStashNamev2.png"
                alt="GiftStash"
                width={300}
                height={80}
                className="mx-auto mb-3 h-16 w-auto"
              />
              <p className="text-gray-600 text-lg font-medium">
                Your personal gift idea stash
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
              className="block w-full px-6 py-4 bg-gradient-to-r from-giftstash-orange to-giftstash-blue text-white rounded-xl hover:from-giftstash-orange-light hover:to-giftstash-blue-light transition-all shadow-lg font-semibold text-center text-lg"
            >
              Open GiftStash →
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

          {/* School Email System */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-green-200 hover:border-green-400 transition-all">
            <div className="text-center mb-6">
              <div className="text-7xl mb-4">📧</div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-3">
                School Emails
              </h2>
              <p className="text-gray-600 text-lg">
                Never miss important school updates
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Analysis</h3>
                  <p className="text-gray-600 text-sm">Auto-categorize and prioritize emails</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Smart Summaries</h3>
                  <p className="text-gray-600 text-sm">Monthly AI-generated insights</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔗</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Auto-Link Events</h3>
                  <p className="text-gray-600 text-sm">Connect to calendar and children</p>
                </div>
              </div>
            </div>

            <a
              href="/emails"
              className="block w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl hover:from-blue-700 hover:to-green-700 transition-all shadow-lg font-semibold text-center text-lg"
            >
              Open School Emails →
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <a
              href="/recipients"
              className="p-4 text-center rounded-xl hover:bg-orange-50 transition-all border border-gray-200 hover:border-giftstash-orange group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">👥</div>
              <div className="text-sm font-medium text-gray-700 group-hover:text-giftstash-orange">Recipients</div>
            </a>
            <a
              href="/gifts"
              className="p-4 text-center rounded-xl hover:bg-orange-50 transition-all border border-gray-200 hover:border-giftstash-orange group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🎁</div>
              <div className="text-sm font-medium text-gray-700 group-hover:text-giftstash-orange">Gifts</div>
            </a>
            <a
              href="/accountability"
              className="p-4 text-center rounded-xl hover:bg-blue-50 transition-all border border-gray-200 hover:border-blue-300"
            >
              <div className="text-3xl mb-2">📋</div>
              <div className="text-sm font-medium text-gray-700">Dashboard</div>
            </a>
            <a
              href="/emails"
              className="p-4 text-center rounded-xl hover:bg-green-50 transition-all border border-gray-200 hover:border-green-300"
            >
              <div className="text-3xl mb-2">📧</div>
              <div className="text-sm font-medium text-gray-700">School Emails</div>
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