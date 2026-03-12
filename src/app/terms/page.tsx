import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
              Terms of Service
            </h1>

            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 mb-6">
                Last updated: December 27, 2024
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

              <h2 id="sms" className="text-2xl font-semibold mt-8 mb-4">SMS Terms of Service</h2>
              <p className="text-gray-700 mb-4">
                By opting into SMS features, you agree to the following:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>You consent to receive SMS messages from GiftStash related to gift tracking</li>
                <li>Message frequency varies based on your usage</li>
                <li>Message and data rates may apply</li>
                <li>You can opt-out at any time by texting STOP</li>
                <li>For help, text HELP or contact support@giftstash.app</li>
              </ul>
              <p className="text-gray-700 mb-4">
                <strong>Supported Carriers:</strong> GiftStash SMS works with major US carriers including AT&T, Verizon, T-Mobile, Sprint, and most regional carriers.
              </p>
              <p className="text-gray-700 mb-6">
                See our full <Link href="/sms-terms" className="text-giftstash-orange hover:underline">SMS Terms &amp; Conditions</Link> for complete details.
              </p>

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
                <li>Use the SMS feature to send spam or unsolicited messages</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Service Availability</h2>
              <p className="text-gray-700 mb-6">
                We strive to provide continuous service but do not guarantee uninterrupted access. We may modify
                or discontinue features at any time.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700 mb-6">
                GiftStash is provided &quot;as is&quot; without warranties of any kind. We are not liable for any damages
                arising from your use of the service, including but not limited to SMS message delivery failures.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to Terms</h2>
              <p className="text-gray-700 mb-6">
                We reserve the right to modify these terms at any time. Continued use of the service constitutes
                acceptance of modified terms.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-6">
                If you have any questions about these Terms of Service, please contact us at support@giftstash.app.
              </p>
            </div>

            <div className="mt-8 pt-8 border-t flex gap-4">
              <Link href="/" className="text-giftstash-orange hover:text-giftstash-orange-light transition-colors">
                ← Back to Home
              </Link>
              <Link href="/privacy" className="text-giftstash-orange hover:text-giftstash-orange-light transition-colors">
                Privacy Policy
              </Link>
              <Link href="/sms-terms" className="text-giftstash-orange hover:text-giftstash-orange-light transition-colors">
                SMS Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
  );
}
