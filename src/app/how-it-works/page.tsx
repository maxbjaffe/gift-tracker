'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Code, Database, Zap, Lock, Cloud, Smartphone } from 'lucide-react'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/GiftStashIconGSv2.png"
              alt="GiftStash"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
              GiftStash
            </span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container px-4 py-12 md:py-16 md:px-6 max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            How{' '}
            <span className="bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
              GiftStash Works
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            A deep dive into the technology powering your gift-giving experience
          </p>
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="container px-4 py-12 md:px-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl border-2 border-gray-200 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              End-to-End{' '}
              <span className="bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
                Product Architecture
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how every component works together to create a seamless gift tracking experience
            </p>
          </div>

          <Image
            src="/images/GSValueImages/GiftStashProductWorkflow.png"
            alt="GiftStash End-to-End Product Workflow & Data Architecture"
            width={1600}
            height={900}
            className="w-full h-auto rounded-xl"
            priority
          />
        </div>

        {/* Technology Stack */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <Code className="h-12 w-12 text-giftstash-orange mb-4" />
              <h3 className="text-xl font-bold mb-2 text-giftstash-orange">Frontend</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Next.js 15 with App Router</li>
                <li>• React 18 with Server Components</li>
                <li>• Tailwind CSS + Radix UI</li>
                <li>• Progressive Web App (PWA)</li>
                <li>• TypeScript for type safety</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <Database className="h-12 w-12 text-giftstash-blue mb-4" />
              <h3 className="text-xl font-bold mb-2 text-giftstash-blue">Database</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Supabase PostgreSQL</li>
                <li>• Row Level Security (RLS)</li>
                <li>• Real-time subscriptions</li>
                <li>• Optimized indexes</li>
                <li>• Automatic backups</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <Zap className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-2 text-purple-600">AI & Processing</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Anthropic Claude API</li>
                <li>• Natural Language Processing</li>
                <li>• Computer Vision Analysis</li>
                <li>• Personalized recommendations</li>
                <li>• Smart gift matching</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-200 hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <Smartphone className="h-12 w-12 text-pink-600 mb-4" />
              <h3 className="text-xl font-bold mb-2 text-pink-600">SMS Integration</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Twilio SMS Gateway</li>
                <li>• Webhook processing</li>
                <li>• MMS image handling</li>
                <li>• Automated reminders</li>
                <li>• Command parsing</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <Lock className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-xl font-bold mb-2 text-green-600">Security</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• End-to-end encryption</li>
                <li>• Secure authentication</li>
                <li>• GDPR compliant</li>
                <li>• Rate limiting</li>
                <li>• Data privacy controls</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <Cloud className="h-12 w-12 text-yellow-600 mb-4" />
              <h3 className="text-xl font-bold mb-2 text-yellow-600">Infrastructure</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Vercel Edge Network</li>
                <li>• Global CDN distribution</li>
                <li>• Automatic scaling</li>
                <li>• 99.9% uptime SLA</li>
                <li>• Zero-downtime deploys</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Data Flow Explanation */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-200">
          <h2 className="text-3xl font-bold mb-6 text-center">
            <span className="bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
              How Data Flows
            </span>
          </h2>

          <div className="space-y-8">
            {/* User Input */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-giftstash-orange to-giftstash-blue flex items-center justify-center text-white font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-giftstash-orange">User Input</h3>
                <p className="text-gray-700">
                  You capture a gift idea via SMS, Chrome extension, or web dashboard. The data is instantly transmitted to our servers with secure encryption.
                </p>
              </div>
            </div>

            {/* AI Processing */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-giftstash-orange to-giftstash-blue flex items-center justify-center text-white font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-giftstash-blue">AI Processing</h3>
                <p className="text-gray-700">
                  Claude AI analyzes your input using natural language processing and computer vision. It extracts product details, prices, and matches to recipients intelligently.
                </p>
              </div>
            </div>

            {/* Database Storage */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-giftstash-orange to-giftstash-blue flex items-center justify-center text-white font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-purple-600">Secure Storage</h3>
                <p className="text-gray-700">
                  Your gift data is stored in Supabase with Row Level Security, ensuring only you can access your gifts. Real-time sync keeps all your devices updated instantly.
                </p>
              </div>
            </div>

            {/* Real-time Updates */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-giftstash-orange to-giftstash-blue flex items-center justify-center text-white font-bold text-xl">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-pink-600">Real-time Updates</h3>
                <p className="text-gray-700">
                  Changes sync across all your devices in milliseconds. Whether you're on your phone, tablet, or computer, your gift list is always up to date.
                </p>
              </div>
            </div>

            {/* Smart Features */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-giftstash-orange to-giftstash-blue flex items-center justify-center text-white font-bold text-xl">
                5
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-green-600">Automated Features</h3>
                <p className="text-gray-700">
                  Cron jobs run daily to send birthday reminders, track price drops, and generate shopping lists. Everything happens automatically in the background.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container px-4 py-16 md:px-6 max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-r from-giftstash-orange to-giftstash-blue rounded-3xl p-8 md:p-12 text-white shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience It Yourself?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands using GiftStash to never forget a gift idea again
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-giftstash-orange hover:bg-gray-100 text-lg px-8 py-6">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="container py-8 px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/images/GiftStashIconGSv2.png"
                alt="GiftStash"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="font-semibold">GiftStash</span>
            </div>
            <p className="text-sm text-gray-600">
              © 2025 GiftStash. Never forget a gift idea again.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
