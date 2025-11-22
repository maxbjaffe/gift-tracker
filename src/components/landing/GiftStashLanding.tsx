'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getCurrentAppConfig } from '@/lib/app-config'

export function GiftStashLanding() {
  const config = getCurrentAppConfig()

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
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-sm">
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-giftstash-orange to-giftstash-blue hover:from-giftstash-orange-light hover:to-giftstash-blue-light text-sm">
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container px-4 py-16 md:py-24 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Never Forget a{' '}
              <span className="bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
                Gift Idea
              </span>{' '}
              Again
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
              Your personal gift stash for every special person in your life
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-giftstash-orange to-giftstash-blue hover:from-giftstash-orange-light hover:to-giftstash-blue-light text-lg px-8 py-6"
              >
                Get Started Free
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6">
                See How It Works
              </Button>
            </Link>
          </div>

          {/* Hero Image/Animation Placeholder */}
          <div className="w-full max-w-3xl mt-12 bg-white rounded-2xl shadow-2xl p-8 border-4 border-orange-200">
            <Image
              src="/images/GiftStashFullLogoV2.png"
              alt="GiftStash App Preview"
              width={800}
              height={500}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="features" className="container px-4 py-16 md:px-6 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Three simple steps to never miss the perfect gift
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-giftstash-orange to-giftstash-blue flex items-center justify-center text-white text-2xl font-bold">
                1
              </div>
              <div className="text-6xl">💡</div>
              <h3 className="text-2xl font-bold">Save Ideas</h3>
              <p className="text-gray-600">
                Capture gift ideas from anywhere - websites, texts, or random thoughts
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-giftstash-orange to-giftstash-blue flex items-center justify-center text-white text-2xl font-bold">
                2
              </div>
              <div className="text-6xl">📋</div>
              <h3 className="text-2xl font-bold">Track & Organize</h3>
              <p className="text-gray-600">
                Organize by person, occasion, and budget with our smart tracking
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-giftstash-orange to-giftstash-blue flex items-center justify-center text-white text-2xl font-bold">
                3
              </div>
              <div className="text-6xl">🎁</div>
              <h3 className="text-2xl font-bold">Give Perfect Gifts</h3>
              <p className="text-gray-600">
                Shop with confidence knowing you have the perfect gift ready
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container px-4 py-16 md:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Everything you need to become the best gift-giver
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 py-16 md:py-24 md:px-6 bg-gradient-to-r from-giftstash-orange to-giftstash-blue">
        <div className="max-w-4xl mx-auto text-center space-y-8 text-white">
          <h2 className="text-3xl md:text-5xl font-bold">
            Ready to Start Saving Gift Ideas?
          </h2>
          <p className="text-xl md:text-2xl opacity-90">
            Join thousands of people who never forget a gift idea
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-white text-giftstash-orange hover:bg-gray-100 text-lg px-8 py-6"
            >
              Get Started Free - No Credit Card Required
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
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
            <p className="text-sm text-gray-600 text-center md:text-left">
              © 2025 GiftStash. Never forget a gift idea again.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-gray-600 hover:text-giftstash-orange">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-giftstash-orange">
                Terms
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-giftstash-orange">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
