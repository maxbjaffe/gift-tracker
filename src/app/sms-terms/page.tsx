import Link from 'next/link';
import { CheckCircle2, MessageSquare, Shield, HelpCircle } from 'lucide-react';

export default function SMSTermsPage() {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
              SMS Terms & Conditions
            </h1>
            <p className="text-gray-600 mb-8">
              Last updated: December 27, 2024
            </p>

            {/* How It Works Section - Shows the CTA/Opt-in Flow */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 mb-8 border border-orange-200">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-giftstash-orange" />
                How SMS Gift Tracking Works
              </h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-giftstash-orange text-white flex items-center justify-center font-bold">1</div>
                  <div>
                    <h3 className="font-semibold">Sign Up & Add Your Phone Number</h3>
                    <p className="text-gray-600">Create a free GiftStash account and add your phone number in Settings. You&apos;ll see a checkbox to opt-in to SMS features.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-giftstash-orange text-white flex items-center justify-center font-bold">2</div>
                  <div>
                    <h3 className="font-semibold">Text Gift Ideas Anytime</h3>
                    <p className="text-gray-600">Text any gift idea to our number. Example: &quot;AirPods Pro for Sarah - $249&quot; or just send a product screenshot!</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-giftstash-orange text-white flex items-center justify-center font-bold">3</div>
                  <div>
                    <h3 className="font-semibold">Get Confirmation</h3>
                    <p className="text-gray-600">You&apos;ll receive a confirmation SMS when your gift idea is saved. View all your ideas in the GiftStash app.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Consent Language Preview - What users see when opting in */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                Opt-In Consent (What You&apos;ll See)
              </h2>
              <p className="text-gray-600 mb-4">
                When you add your phone number in GiftStash Settings, you&apos;ll see this consent checkbox:
              </p>

              {/* Mock consent checkbox UI */}
              <div className="bg-white rounded-lg p-4 border border-gray-300 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 border-2 border-giftstash-orange rounded bg-giftstash-orange flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">
                      I agree to receive SMS messages from GiftStash
                    </p>
                    <p className="text-gray-600 mt-1">
                      By checking this box, you consent to receive SMS messages from GiftStash for gift tracking confirmations and service updates. Message frequency varies. Message and data rates may apply. Reply STOP to opt-out, HELP for help. See our{' '}
                      <span className="text-giftstash-orange">SMS Terms</span> and{' '}
                      <span className="text-giftstash-orange">Privacy Policy</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Full SMS Terms */}
            <div className="prose prose-gray max-w-none">
              <h2 className="text-2xl font-semibold mt-8 mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-giftstash-orange" />
                Full SMS Terms & Conditions
              </h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">Program Description</h3>
              <p className="text-gray-700 mb-4">
                GiftStash SMS allows you to save gift ideas by texting them directly to our service. When you text a gift idea (with optional recipient name, price, and product link), our AI will parse your message and save it to your GiftStash account. You&apos;ll receive a confirmation SMS when your gift is saved.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Consent & Opt-In</h3>
              <p className="text-gray-700 mb-4">
                By providing your phone number and checking the SMS consent box in your GiftStash account settings, you expressly consent to receive SMS messages from GiftStash. This is an opt-in service - you will not receive SMS messages unless you explicitly enable this feature.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Message Types</h3>
              <p className="text-gray-700 mb-4">
                You may receive the following types of SMS messages:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Gift Confirmations:</strong> Sent when you text a gift idea and it&apos;s successfully saved</li>
                <li><strong>Welcome Message:</strong> One-time message when you first enable SMS features</li>
                <li><strong>Help Responses:</strong> Sent when you text HELP</li>
                <li><strong>Service Updates:</strong> Occasional updates about the SMS feature (rare)</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Message Frequency</h3>
              <p className="text-gray-700 mb-4">
                Message frequency varies based on your usage. You will receive one confirmation message each time you text a gift idea to GiftStash. There are no recurring marketing messages.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Costs</h3>
              <p className="text-gray-700 mb-4">
                <strong>Message and data rates may apply.</strong> GiftStash does not charge for SMS messages, but your mobile carrier may charge standard messaging rates. Check with your carrier for details about your text messaging plan.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Opt-Out Instructions</h3>
              <p className="text-gray-700 mb-4">
                You can stop receiving SMS messages at any time by:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Texting STOP:</strong> Reply STOP to any message to immediately unsubscribe</li>
                <li><strong>Account Settings:</strong> Disable SMS features in your GiftStash account settings</li>
              </ul>
              <p className="text-gray-700 mb-4">
                After texting STOP, you will receive a one-time confirmation message and will no longer receive SMS messages from GiftStash.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Help & Support</h3>
              <p className="text-gray-700 mb-4">
                For help with SMS features:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Text HELP:</strong> Reply HELP to any message for assistance</li>
                <li><strong>Email:</strong> Contact support@giftstash.app</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Supported Carriers</h3>
              <p className="text-gray-700 mb-4">
                GiftStash SMS works with major US carriers including but not limited to: AT&T, Verizon, T-Mobile, Sprint, U.S. Cellular, and most regional and prepaid carriers. Carriers are not liable for delayed or undelivered messages.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Privacy</h3>
              <p className="text-gray-700 mb-4">
                Your phone number and SMS content are kept private and secure. We do not sell, rent, or share your phone number with third parties for marketing purposes. For complete details, see our <Link href="/privacy#sms" className="text-giftstash-orange hover:underline">Privacy Policy</Link>.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Changes to Terms</h3>
              <p className="text-gray-700 mb-4">
                We may update these SMS terms from time to time. Continued use of the SMS feature after changes constitutes acceptance of the updated terms.
              </p>
            </div>

            {/* Quick Reference Card */}
            <div className="bg-blue-50 rounded-xl p-6 mt-8 border border-blue-200">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                Quick Reference
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-900">To opt-out:</p>
                  <p className="text-gray-600">Text STOP</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">For help:</p>
                  <p className="text-gray-600">Text HELP or email support@giftstash.app</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Message frequency:</p>
                  <p className="text-gray-600">Varies by usage (confirmations only)</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Cost:</p>
                  <p className="text-gray-600">Free (carrier rates may apply)</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t flex gap-4">
              <Link href="/" className="text-giftstash-orange hover:text-giftstash-orange-light transition-colors">
                ← Back to Home
              </Link>
              <Link href="/privacy" className="text-giftstash-orange hover:text-giftstash-orange-light transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-giftstash-orange hover:text-giftstash-orange-light transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
  );
}
