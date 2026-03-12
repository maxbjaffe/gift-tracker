import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
              Privacy Policy
            </h1>

            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 mb-6">
                Last updated: December 27, 2024
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                GiftStash collects and stores the following information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                <li>Account information (email address, name)</li>
                <li>Phone number (if you opt-in to SMS features)</li>
                <li>Gift ideas and recipient information you create</li>
                <li>SMS message content sent to our service</li>
                <li>Usage data and analytics</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use your information to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                <li>Provide and improve our gift tracking service</li>
                <li>Process SMS messages to save gift ideas</li>
                <li>Send SMS confirmations and notifications</li>
                <li>Analyze usage patterns to enhance user experience</li>
              </ul>

              <h2 id="sms" className="text-2xl font-semibold mt-8 mb-4">SMS Communications</h2>
              <p className="text-gray-700 mb-4">
                When you opt-in to SMS features, GiftStash will:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Store your phone number securely in our database</li>
                <li>Receive and process SMS messages you send to our service</li>
                <li>Send confirmation messages when gift ideas are saved</li>
                <li>Send occasional service-related notifications</li>
              </ul>
              <p className="text-gray-700 mb-4">
                <strong>Message frequency:</strong> Message frequency varies based on your usage. You will receive a confirmation SMS each time you text a gift idea to GiftStash, plus occasional service updates.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Message and data rates may apply.</strong> Check with your carrier for details about your text messaging plan.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Opting out:</strong> You can stop receiving SMS messages at any time by texting STOP to our number. You will receive a one-time confirmation that you have been unsubscribed. After opting out, you will no longer receive SMS messages from GiftStash.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Help:</strong> For help, text HELP to our number or email support@giftstash.app.
              </p>
              <p className="text-gray-700 mb-6">
                <strong>We do not sell, rent, or share your phone number with third parties for marketing purposes.</strong> Your phone number is used solely for providing GiftStash SMS services.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
              <p className="text-gray-700 mb-6">
                We use industry-standard security measures to protect your data, including encryption in transit and at rest. Your gift ideas, personal information, and phone number are stored securely and are only accessible to you.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Third-Party Services</h2>
              <p className="text-gray-700 mb-4">
                GiftStash uses the following third-party services:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                <li><strong>Supabase</strong> - Authentication and data storage</li>
                <li><strong>Twilio</strong> - SMS messaging services</li>
                <li><strong>Anthropic (Claude AI)</strong> - Natural language processing for gift idea extraction</li>
                <li><strong>Vercel</strong> - Web hosting</li>
              </ul>
              <p className="text-gray-700 mb-6">
                Your data is subject to these providers&apos; respective privacy policies.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Data Retention</h2>
              <p className="text-gray-700 mb-6">
                We retain your data for as long as your account is active. If you delete your account, we will delete your personal information, including your phone number, within 30 days. Some anonymized usage data may be retained for analytics purposes.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>
              <p className="text-gray-700 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                <li>Access your personal data at any time</li>
                <li>Modify or correct your information</li>
                <li>Delete your account and all associated data</li>
                <li>Opt-out of SMS communications at any time</li>
                <li>Export your gift data</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-6">
                If you have any questions about this Privacy Policy or our data practices, please contact us at support@giftstash.app.
              </p>
            </div>

            <div className="mt-8 pt-8 border-t flex gap-4">
              <Link href="/" className="text-giftstash-orange hover:text-giftstash-orange-light transition-colors">
                ← Back to Home
              </Link>
              <Link href="/terms" className="text-giftstash-orange hover:text-giftstash-orange-light transition-colors">
                Terms of Service
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
