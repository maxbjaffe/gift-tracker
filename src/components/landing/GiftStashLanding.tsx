'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Chrome, MessageSquare, Sparkles, Gift, Users, TrendingUp } from 'lucide-react'

// Rotating taglines for emotional connection
const TAGLINES = [
  { text: "Because the best gifts aren't asked for", emphasis: "best gifts" },
  { text: "They shouldn't have to ask", emphasis: "shouldn't" },
  { text: "The joy is in the giving", emphasis: "joy" },
  { text: "From 'she'd love that' to 'she loved that'", emphasis: "'she loved that'" },
  { text: "Thoughtful gifts don't come from a wishlist", emphasis: "Thoughtful" },
]

export function GiftStashLanding() {
  const [taglineIndex, setTaglineIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  // Rotate taglines every 4 seconds with fade effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setTaglineIndex((prev) => (prev + 1) % TAGLINES.length)
        setIsVisible(true)
      }, 300)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const currentTagline = TAGLINES[taglineIndex]

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

      {/* Hero Section */}
      <section className="container px-4 py-16 md:py-24 md:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Rotating tagline */}
          <p
            className={`text-orange-500 font-medium text-lg transition-opacity duration-300 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {currentTagline.text}
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
            Never forget a gift idea again
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Capture gift ideas the moment inspiration strikes. Text them, clip them from websites, or let AI help you discover the perfect present.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-base px-8">
                Get Started Free
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            No credit card required
          </p>
        </div>
      </section>

      {/* SMS Feature Highlight */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                  <MessageSquare className="h-4 w-4" />
                  Text to Save
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Save gift ideas from anywhere with a simple text
                </h2>
                <p className="text-gray-600">
                  Add GiftStash to your contacts, then text gift ideas whenever they come to you.
                  Shopping with friends? Text it. Overheard a great idea? Text it.
                  No app to open, no login required.
                </p>
                <div className="bg-white rounded-lg p-4 border shadow-sm">
                  <p className="text-sm text-gray-500 mb-2">Example texts:</p>
                  <div className="space-y-2 text-sm">
                    <p className="bg-blue-50 text-blue-800 px-3 py-2 rounded-lg inline-block">"AirPods for Mom - $249"</p>
                    <br />
                    <p className="bg-blue-50 text-blue-800 px-3 py-2 rounded-lg inline-block">"LEGO set for Jake's birthday"</p>
                  </div>
                </div>
                <a href="/api/contact/vcard" download="GiftStash.vcf">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-base">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Save GiftStash to Contacts
                  </Button>
                </a>
              </div>
              <div className="flex-shrink-0">
                <div className="w-48 h-48 md:w-56 md:h-56 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl">
                  <MessageSquare className="h-24 w-24 md:h-28 md:w-28 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 3 simple methods */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              Three ways to capture gift ideas
            </h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              However inspiration strikes, GiftStash is ready
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">Text It</h3>
                <p className="text-gray-600 text-sm">
                  Text gift ideas anytime. No app needed - just message GiftStash like you would a friend.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <Chrome className="h-7 w-7 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold">Clip It</h3>
                <p className="text-gray-600 text-sm">
                  One-click save from any website. Our Chrome extension captures price, image, and link automatically.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold">Ask AI</h3>
                <p className="text-gray-600 text-sm">
                  Stuck? Our AI suggests personalized gifts based on interests, age, and your budget.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Compact grid */}
      <section className="border-t bg-gray-50 py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              Stay organized, give better
            </h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Simple tools for thoughtful gift-giving
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <Gift className="h-8 w-8 text-orange-500 mb-3" />
                  <h3 className="font-semibold mb-2">Track Every Gift</h3>
                  <p className="text-sm text-gray-600">
                    From idea to purchased to wrapped to given. Always know where you stand.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <Users className="h-8 w-8 text-blue-500 mb-3" />
                  <h3 className="font-semibold mb-2">Know Your People</h3>
                  <p className="text-sm text-gray-600">
                    Store interests, sizes, and preferences. Give gifts that show you were listening.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <TrendingUp className="h-8 w-8 text-green-500 mb-3" />
                  <h3 className="font-semibold mb-2">Budget Wisely</h3>
                  <p className="text-sm text-gray-600">
                    Set spending limits per person or occasion. No more holiday surprises.
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
              The next great gift idea is just a text away
            </h2>
            <p className="text-orange-100">
              Sign up free, save GiftStash to your contacts, and never lose a gift idea again.
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
              © 2025 GiftStash. Thoughtful gifts don't come from a wishlist.
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
