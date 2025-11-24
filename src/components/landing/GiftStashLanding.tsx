'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProductTourModal } from '@/components/ProductTourModal'
import { DayInLifeCarousel } from '@/components/DayInLifeCarousel'
import { getCurrentAppConfig } from '@/lib/app-config'
import { Play } from 'lucide-react'

export function GiftStashLanding() {
  const config = getCurrentAppConfig()
  const [showTour, setShowTour] = useState(false)

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
            <Button
              variant="ghost"
              className="text-sm hidden sm:flex"
              onClick={() => setShowTour(true)}
            >
              <Play className="h-4 w-4 mr-2" />
              Take a Tour
            </Button>
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

      <ProductTourModal isOpen={showTour} onClose={() => setShowTour(false)} />

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
              Save gift ideas from any website with our Chrome extension, text to save via SMS, and get AI-powered suggestions
            </p>
          </div>

          {/* SMS Quick Start Card */}
          <div className="w-full max-w-2xl bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
            <div className="flex flex-col items-center gap-4">
              <div className="text-4xl">📱</div>
              <h3 className="text-xl md:text-2xl font-bold text-center">
                Text Gift Ideas On The Go
              </h3>
              <p className="text-center text-gray-700">
                Add GiftStash to your contacts and text gift ideas anytime - no app needed!
              </p>
              <a
                href="/api/contact/vcard"
                download="GiftStash.vcf"
                className="w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-giftstash-blue to-giftstash-orange hover:shadow-xl text-white text-lg px-8 py-6"
                >
                  📇 Add to Contacts
                </Button>
              </a>
              <p className="text-sm text-gray-600 text-center">
                Then text: "LEGO set for Mom" or "AirPods for Sarah - $249"
              </p>
            </div>
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
            <Link href="#extension" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 border-2">
                🧩 Get Chrome Extension
              </Button>
            </Link>
          </div>

          {/* Hero Image - App Preview */}
          <div className="w-full max-w-4xl mt-12 bg-white rounded-2xl shadow-2xl p-6 md:p-10 border border-gray-100">
            <div className="flex flex-col items-center gap-8">
              <Image
                src="/images/GiftStashFull-800.png"
                alt="GiftStash Logo"
                width={800}
                height={211}
                className="w-full max-w-2xl h-auto"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                <Card className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200 hover:shadow-xl transition-all hover:scale-105">
                  <div className="text-5xl">🧩</div>
                  <p className="text-base font-bold text-center bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
                    Chrome Extension
                  </p>
                  <p className="text-xs text-gray-600 text-center">One-click save from any site</p>
                </Card>
                <Card className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:shadow-xl transition-all hover:scale-105">
                  <div className="text-5xl">📱</div>
                  <p className="text-base font-bold text-center bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
                    SMS Integration
                  </p>
                  <p className="text-xs text-gray-600 text-center">Text ideas on the go</p>
                </Card>
                <Card className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 hover:shadow-xl transition-all hover:scale-105">
                  <div className="text-5xl">🤖</div>
                  <p className="text-base font-bold text-center bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
                    AI Suggestions
                  </p>
                  <p className="text-xs text-gray-600 text-center">Smart gift recommendations</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gift Idea Management Lifecycle */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              The Gift Idea Management{' '}
              <span className="bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
                Lifecycle
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform gift-giving into a seamless, organized, and joyful experience
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-blue-50 rounded-3xl p-6 md:p-10 shadow-2xl border-2 border-orange-200">
            <Image
              src="/images/GSValueImages/GiftStashEduOverview.png"
              alt="The Gift Idea Management Lifecycle - Capture, Organize, Decide, Track"
              width={1600}
              height={600}
              className="w-full h-auto rounded-xl"
              priority
            />
          </div>

          {/* Key Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="text-4xl mb-3">💡</div>
                <h3 className="font-bold text-lg mb-2 text-giftstash-orange">Capture Ideas</h3>
                <p className="text-sm text-gray-700">
                  Never forget a gift idea by capturing it immediately from anywhere via SMS, browser, or web
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="text-4xl mb-3">📋</div>
                <h3 className="font-bold text-lg mb-2 text-giftstash-blue">Organize & Plan</h3>
                <p className="text-sm text-gray-700">
                  Structured organization prevents scattered notes and last-minute stress with smart budgeting
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="text-4xl mb-3">🛒</div>
                <h3 className="font-bold text-lg mb-2 text-purple-600">Decide & Purchase</h3>
                <p className="text-sm text-gray-700">
                  Smart tools and AI inspiration help find the perfect gift within budget
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-200 hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="text-4xl mb-3">🎁</div>
                <h3 className="font-bold text-lg mb-2 text-pink-600">Track Progress</h3>
                <p className="text-sm text-gray-700">
                  Monitor the gift lifecycle through stages while tracking overall spending
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Complete Solution Framework */}
      <section id="features" className="py-16 md:py-24 bg-gradient-to-br from-orange-50/50 via-blue-50/50 to-purple-50/50">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Your{' '}
              <span className="bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
                Complete Solution
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Multi-channel capture meets intelligent organization with AI-powered insights
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl border-2 border-gray-200">
            <Image
              src="/images/GSValueImages/GiftStashvisualframework.png"
              alt="GiftStash Complete Solution Framework - Multi-Channel Capture, Smart Organization, AI Intelligence, Budget Analytics"
              width={1600}
              height={800}
              className="w-full h-auto rounded-xl"
            />
          </div>

          {/* Feature Highlight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 hover:shadow-xl transition-all hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="text-5xl mb-4">📱</div>
                <h3 className="font-bold text-xl mb-2 bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
                  Multi-Channel Capture
                </h3>
                <p className="text-sm text-gray-600">
                  SMS, Chrome Extension, or Web Dashboard - save ideas your way
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:shadow-xl transition-all hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="font-bold text-xl mb-2 bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
                  Smart Organization
                </h3>
                <p className="text-sm text-gray-600">
                  Recipient profiles, status workflow, smart filters
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 hover:shadow-xl transition-all hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="text-5xl mb-4">🤖</div>
                <h3 className="font-bold text-xl mb-2 bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
                  AI-Powered Intelligence
                </h3>
                <p className="text-sm text-gray-600">
                  Personalized recommendations, vision analysis, smart parsing
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-200 hover:shadow-xl transition-all hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="text-5xl mb-4">💰</div>
                <h3 className="font-bold text-xl mb-2 bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
                  Budget & Analytics
                </h3>
                <p className="text-sm text-gray-600">
                  Track spending, set budgets, shopping lists
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Chrome Extension Highlight Section */}
      <section id="extension" className="py-16 md:py-24 bg-gradient-to-r from-giftstash-blue to-giftstash-orange">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-2">
                🧩 Chrome Extension
              </div>
              <h2 className="text-3xl md:text-5xl font-bold">
                Save Gift Ideas While You Browse
              </h2>
              <p className="text-xl md:text-2xl opacity-90">
                Spotted the perfect gift online? Save it to GiftStash with one click. Our Chrome extension works on any website - Amazon, Etsy, Target, anywhere.
              </p>
              <ul className="space-y-4 text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <span>One-click save from any website</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <span>Automatically captures price, image, and link</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <span>Assign to recipients right from the popup</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <span>Track price changes and get deal alerts</span>
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-white text-giftstash-blue hover:bg-gray-100 text-lg px-8 py-6 shadow-xl"
                  asChild
                >
                  <a href="https://chrome.google.com/webstore" target="_blank" rel="noopener noreferrer">
                    Add to Chrome - It's Free
                  </a>
                </Button>
                <Link href="/signup">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white/10"
                  >
                    Sign Up First
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <Card className="bg-white p-6 shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <Image
                      src="/images/GiftStashIconGSv2.png"
                      alt="GiftStash Extension"
                      width={48}
                      height={48}
                      className="h-12 w-12"
                    />
                    <div>
                      <h3 className="font-bold text-lg">GiftStash</h3>
                      <p className="text-sm text-gray-600">Save this gift idea</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-semibold mb-1">Product Name</p>
                      <p className="text-xs text-gray-600">Wireless Headphones - Premium Sound</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-semibold mb-1">Price</p>
                      <p className="text-xs text-gray-600">$129.99</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-semibold mb-1">For:</p>
                      <div className="flex gap-2 mt-2">
                        <div className="px-3 py-1 bg-giftstash-orange/10 text-giftstash-orange rounded-full text-xs font-semibold">
                          Mom
                        </div>
                        <div className="px-3 py-1 bg-giftstash-blue/10 text-giftstash-blue rounded-full text-xs font-semibold">
                          Sister
                        </div>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-giftstash-orange to-giftstash-blue">
                      Save Gift
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* User Journey / Getting Started */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Getting Started is{' '}
              <span className="bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
                Simple & Quick
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From signup to saving your first gift in under 5 minutes
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-6 md:p-10 shadow-2xl border-2 border-blue-200">
            <Image
              src="/images/GSValueImages/Giftstashuserjourney.png"
              alt="GiftStash User Journey - New User Onboarding Flow from Discovery to First Gift"
              width={1600}
              height={800}
              className="w-full h-auto rounded-xl"
            />
          </div>

          {/* Journey Steps Highlight */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-12">
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 hover:shadow-xl transition-all">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">🔍</div>
                <h4 className="font-bold text-sm mb-1 text-giftstash-orange">Discovery & Signup</h4>
                <p className="text-xs text-gray-600">
                  Find GiftStash, see value props, sign up free
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:shadow-xl transition-all">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">✉️</div>
                <h4 className="font-bold text-sm mb-1 text-giftstash-blue">Account Creation</h4>
                <p className="text-xs text-gray-600">
                  Simple email signup, confirm, access dashboard
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 hover:shadow-xl transition-all">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">📱</div>
                <h4 className="font-bold text-sm mb-1 text-purple-600">SMS Setup</h4>
                <p className="text-xs text-gray-600">
                  Add to contacts, text first gift, instant gratification
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-200 hover:shadow-xl transition-all">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">🧩</div>
                <h4 className="font-bold text-sm mb-1 text-pink-600">Extension Install</h4>
                <p className="text-xs text-gray-600">
                  One-click Chrome install, browse and save
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 hover:shadow-xl transition-all">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">🎁</div>
                <h4 className="font-bold text-sm mb-1 text-green-600">First Gift Saved</h4>
                <p className="text-xs text-gray-600">
                  Organize with recipients, feel accomplished
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Day in the Life Stories */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50/30 via-blue-50/30 to-purple-50/30">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-giftstash-orange to-giftstash-blue text-white rounded-full text-sm font-semibold mb-4">
              📖 Real Stories, Real People
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              See{' '}
              <span className="bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
                GiftStash in Action
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From superheroes to busy parents to smart teens - discover how GiftStash fits into everyday life
            </p>
          </div>

          <DayInLifeCarousel />

          <div className="text-center mt-8">
            <p className="text-sm text-gray-600 mb-4">
              Stories auto-rotate every 8 seconds • Click arrows to browse
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50/50 via-blue-50/50 to-purple-50/50">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            Everything you need to become the best gift-giver
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.features.map((feature, index) => (
              <Card key={index} className="hover:shadow-xl transition-all hover:scale-105 bg-white border border-gray-100">
                <CardContent className="p-6">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-giftstash-orange to-giftstash-blue">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto text-center space-y-8 text-white">
          <h2 className="text-3xl md:text-5xl font-bold">
            Ready to Start Saving Gift Ideas?
          </h2>
          <p className="text-xl md:text-2xl opacity-90">
            Join thousands of people who never forget a gift idea
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-white text-giftstash-orange hover:bg-gray-100 text-lg px-8 py-6 shadow-xl"
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
              <Link href="/about" className="text-gray-600 hover:text-giftstash-orange">
                About
              </Link>
              <Link href="/how-it-works" className="text-gray-600 hover:text-giftstash-orange">
                How It Works
              </Link>
              <Link href="/privacy" className="text-gray-600 hover:text-giftstash-orange">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-giftstash-orange">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
