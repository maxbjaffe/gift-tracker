// src/app/page.tsx - SIMPLE WORKING VERSION

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎁 Gift Tracker
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Never forget a gift idea again. Track presents for your family with AI-powered price checking and personalized recommendations.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/recipients"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg font-medium"
            >
              Get Started
            </a>
            <a
              href="/recipients"
              className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-lg font-medium"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Track Recipients
            </h3>
            <p className="text-gray-600">
              Manage gift ideas for each person with profiles, budgets, and interests
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-5xl mb-4">🛒</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Smart Price Tracking
            </h3>
            <p className="text-gray-600">
              AI automatically finds the best prices across Amazon, Target, Walmart, and more
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              AI Recommendations
            </h3>
            <p className="text-gray-600">
              Get personalized gift suggestions based on age, interests, and past preferences
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-xl p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">0</div>
              <div className="text-gray-600">Recipients Tracked</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">0</div>
              <div className="text-gray-600">Gift Ideas Saved</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">$0</div>
              <div className="text-gray-600">Saved with Price Tracking</div>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-3xl mb-2">👥</div>
              <h3 className="font-bold text-gray-900 mb-2">Recipient Profiles</h3>
              <p className="text-gray-600 text-sm">
                Detailed profiles with birthdays, interests, and gift history
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-bold text-gray-900 mb-2">Budget Dashboard</h3>
              <p className="text-gray-600 text-sm">
                Track spending and manage budgets across all recipients
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}