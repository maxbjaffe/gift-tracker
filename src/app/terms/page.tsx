import Link from 'next/link';
import { GiftStashNav } from '@/components/GiftStashNav';

export default function TermsPage() {
  return (
    <>
      <GiftStashNav />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
              Terms of Service
            </h1>

            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 mb-6">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Acceptance of Terms</h2>
              <p className="text-gray-700 mb-6">
                By accessing and using GiftStash, you accept and agree to be bound by the terms and provisions
                of this agreement.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Use of Service</h2>
              <p className="text-gray-700 mb-4">
                GiftStash provides a platform for tracking gift ideas and managing gift-giving. You agree to use
                this service only for lawful purposes.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">User Accounts</h2>
              <p className="text-gray-700 mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                <li>Maintaining the confidentiality of your account</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us of any unauthorized use</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Content</h2>
              <p className="text-gray-700 mb-6">
                You retain all rights to the content you create on GiftStash. We will never share your gift ideas
                or recipient information with third parties without your consent.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Prohibited Activities</h2>
              <p className="text-gray-700 mb-4">
                You may not:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                <li>Use the service for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to the service</li>
                <li>Interfere with or disrupt the service</li>
                <li>Share your account with others</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Service Availability</h2>
              <p className="text-gray-700 mb-6">
                We strive to provide continuous service but do not guarantee uninterrupted access. We may modify
                or discontinue features at any time.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700 mb-6">
                GiftStash is provided "as is" without warranties of any kind. We are not liable for any damages
                arising from your use of the service.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to Terms</h2>
              <p className="text-gray-700 mb-6">
                We reserve the right to modify these terms at any time. Continued use of the service constitutes
                acceptance of modified terms.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-6">
                If you have any questions about these Terms of Service, please contact us through our feedback form.
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
