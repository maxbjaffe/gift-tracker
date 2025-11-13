'use client';

import ChatInterface from '@/components/ChatInterface';
import Link from 'next/link';

export default function GiftFinderPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-4 text-sm md:text-base"
          >
            ← Back to Dashboard
          </Link>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">💬</span>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                AI Gift Finder
              </h1>
            </div>
            <p className="text-gray-600 text-sm md:text-base">
              Chat with our AI assistant to discover the perfect gift. Just describe who you're shopping for!
            </p>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
          <ChatInterface />
        </div>

        {/* Tips */}
        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">💡 Tips for better recommendations:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>Be specific about age, interests, and hobbies</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>Mention your budget range</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>Tell us the occasion (birthday, holiday, anniversary, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>Ask follow-up questions or request alternatives!</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
