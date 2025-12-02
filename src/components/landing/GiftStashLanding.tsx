'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Chrome, MessageSquare, Sparkles, Gift, Users, TrendingUp } from 'lucide-react'

export function GiftStashLanding() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/GiftStashIconGSv2.png"
              alt="GiftStash"
              width={36}
              height={36}
              className="h-9 w-9"
            />
            <span className="text-xl font-bold text-gray-900">
              GiftStash
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Clean and focused */}
      <section className="container px-4 py-16 md:py-24 md:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
            Never forget a gift idea again
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Save gift ideas from anywhere - text them, clip them from websites, or let AI suggest them. Stay organized and never scramble for last-minute gifts.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-base px-8">
                Get Started Free
              </Button>
            </Link>
            <a href="/api/contact/vcard" download="GiftStash.vcf">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8">
                <MessageSquare className="h-4 w-4 mr-2" />
                Add to Contacts
              </Button>
            </a>
          </div>
          <p className="text-sm text-gray-500">
            No credit card required
          </p>
        </div>
      </section>

      {/* How It Works - 3 simple steps */}
      <section className="border-y bg-gray-50 py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              Three ways to save gift ideas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">Text It</h3>
                <p className="text-gray-600 text-sm">
                  Add GiftStash to your contacts and text gift ideas anytime. Just send "AirPods for Mom - $249"
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <Chrome className="h-7 w-7 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold">Clip It</h3>
                <p className="text-gray-600 text-sm">
                  Use our Chrome extension to save gifts from any website with one click. Price, image, and link included.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold">Ask AI</h3>
                <p className="text-gray-600 text-sm">
                  Not sure what to get? Our AI suggests personalized gift ideas based on the recipient's interests.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Compact grid */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              Everything you need to be a great gift-giver
            </h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Simple tools that make gift-giving organized and stress-free
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <Gift className="h-8 w-8 text-orange-500 mb-3" />
                  <h3 className="font-semibold mb-2">Gift Tracking</h3>
                  <p className="text-sm text-gray-600">
                    Track gifts from idea to given. Know what you've purchased, wrapped, and delivered.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <Users className="h-8 w-8 text-blue-500 mb-3" />
                  <h3 className="font-semibold mb-2">Recipient Profiles</h3>
                  <p className="text-sm text-gray-600">
                    Store interests, sizes, and preferences. Never give the wrong size again.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <TrendingUp className="h-8 w-8 text-green-500 mb-3" />
                  <h3 className="font-semibold mb-2">Budget Tracking</h3>
                  <p className="text-sm text-gray-600">
                    Set budgets per person or occasion. See spending at a glance.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start CTA */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center text-white space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">
              Start saving gift ideas in 30 seconds
            </h2>
            <p className="text-orange-100">
              Sign up free and add GiftStash to your contacts. The next great gift idea is just a text away.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto bg-white text-orange-600 hover:bg-orange-50">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Simple */}
      <footer className="border-t py-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/images/GiftStashIconGSv2.png"
                alt="GiftStash"
                width={24}
                height={24}
                className="h-6 w-6"
              />
              <span className="text-sm font-medium text-gray-700">GiftStash</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2025 GiftStash. Never forget a gift idea again.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-gray-500 hover:text-gray-700">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-gray-700">
                Terms
              </Link>
              <Link href="/setup" className="text-gray-500 hover:text-gray-700">
                Setup
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
