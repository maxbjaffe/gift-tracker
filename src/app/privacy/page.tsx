import Link from 'next/link';
import { GiftStashNav } from '@/components/GiftStashNav';

export default function PrivacyPage() {
  return (
    <>
      <GiftStashNav />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
              Privacy Policy
            </h1>

            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 mb-6">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                GiftStash collects and stores the following information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                <li>Account information (email address, name)</li>
                <li>Gift ideas and recipient information you create</li>
                <li>Usage data and analytics</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use your information to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                <li>Provide and improve our gift tracking service</li>
                <li>Send you notifications and updates</li>
                <li>Analyze usage patterns to enhance user experience</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
              <p className="text-gray-700 mb-6">
                We use industry-standard security measures to protect your data. Your gift ideas and personal
                information are stored securely and are only accessible to you.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Third-Party Services</h2>
              <p className="text-gray-700 mb-6">
                GiftStash uses Supabase for authentication and data storage. Your data is subject to their
                privacy policy as well.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>
              <p className="text-gray-700 mb-6">
                You have the right to access, modify, or delete your data at any time through your account settings.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-6">
                If you have any questions about this Privacy Policy, please contact us through our feedback form.
              </p>
            </div>

            <div className="mt-8 pt-8 border-t">
              <Link href="/" className="text-giftstash-orange hover:text-giftstash-orange-light transition-colors">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
