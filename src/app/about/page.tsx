'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Heart, Users, Target, Lightbulb, Code, RefreshCw } from 'lucide-react'

const dayInLifeStories = [
  {
    id: 'wonder-planner',
    title: 'Wonder Planner',
    subtitle: 'For the Superhero Multitasker',
    image: '/images/GSValueImages/GS Day in life super hero v2.png',
    description: 'Even heroes need help remembering gift ideas. From morning rescues to evening planning - GiftStash keeps you organized.',
    persona: 'The Organized Achiever',
  },
  {
    id: 'three-personas',
    title: 'Real People, Real Stories',
    subtitle: 'GiftStash Fits Every Lifestyle',
    image: '/images/GSValueImages/GS Day In Life v2.png',
    description: 'Whether you\'re a busy professional, juggling family chaos, or exploring creative passions - GiftStash adapts to your life.',
    persona: 'Everyone',
  },
  {
    id: 'captain-thoughtful',
    title: 'Captain Thoughtful',
    subtitle: 'Master of Meaningful Gifts',
    image: '/images/GSValueImages/GS Day in the life - superhero.png',
    description: 'Save the day (and gift-giving) with instant idea capture, seamless browsing, and AI-powered organization.',
    persona: 'The Thoughtful Giver',
  },
  {
    id: 'teen-leo',
    title: 'Leo\'s GiftStash Hack',
    subtitle: 'Teen vs. Parent Gifts - Solved!',
    image: '/images/GSValueImages/GS Day in the life - teen.png',
    description: 'Birthday panic? Not anymore. Leo uses GiftStash to nail gift ideas, get reminders, and score major points with the parents.',
    persona: 'The Smart Teen',
  },
]

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState('mission')
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)

  // Randomly select a story on page load
  useEffect(() => {
    setCurrentStoryIndex(Math.floor(Math.random() * dayInLifeStories.length))
  }, [])

  const handleNextStory = () => {
    // Get a different random story
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * dayInLifeStories.length)
    } while (newIndex === currentStoryIndex && dayInLifeStories.length > 1)
    setCurrentStoryIndex(newIndex)
  }

  const currentStory = dayInLifeStories[currentStoryIndex]

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
  }

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

      {/* Sub Navigation */}
      <nav className="sticky top-16 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container px-4 md:px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-2">
            <Button
              variant={activeSection === 'mission' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => scrollToSection('mission')}
              className={activeSection === 'mission' ? 'bg-gradient-to-r from-giftstash-orange to-giftstash-blue text-white' : ''}
            >
              <Heart className="h-4 w-4 mr-2" />
              Mission
            </Button>
            <Button
              variant={activeSection === 'tech-stack' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => scrollToSection('tech-stack')}
              className={activeSection === 'tech-stack' ? 'bg-gradient-to-r from-giftstash-orange to-giftstash-blue text-white' : ''}
            >
              <Code className="h-4 w-4 mr-2" />
              Tech Stack
            </Button>
            <Button
              variant={activeSection === 'who-we-serve' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => scrollToSection('who-we-serve')}
              className={activeSection === 'who-we-serve' ? 'bg-gradient-to-r from-giftstash-orange to-giftstash-blue text-white' : ''}
            >
              <Users className="h-4 w-4 mr-2" />
              Who We Serve
            </Button>
            <Button
              variant={activeSection === 'day-in-life' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => scrollToSection('day-in-life')}
              className={activeSection === 'day-in-life' ? 'bg-gradient-to-r from-giftstash-orange to-giftstash-blue text-white' : ''}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Day in the Life
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container px-4 py-12 md:py-16 md:px-6 max-w-6xl mx-auto">
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            About{' '}
            <span className="bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
              GiftStash
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            Transforming gift-giving from a stressful chore into a seamless, joyful experience
          </p>
        </div>
      </section>

      {/* Mission Statement & Problem */}
      <section id="mission" className="container px-4 pb-12 md:px-6 max-w-6xl mx-auto scroll-mt-32">
        <Card className="bg-gradient-to-r from-giftstash-orange to-giftstash-blue border-0 mb-12">
          <CardContent className="p-8 md:p-12 text-center text-white">
            <Heart className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Mission</h2>
            <p className="text-xl md:text-2xl opacity-95 leading-relaxed">
              To help people celebrate the special moments in life by ensuring they never forget a thoughtful gift idea. We believe gift-giving should be joyful, not stressful.
            </p>
          </CardContent>
        </Card>

        {/* The Problem */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-200">
          <div className="text-center mb-8">
            <Target className="h-16 w-16 mx-auto mb-4 text-giftstash-orange" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The Problem We're Solving
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200">
              <CardContent className="p-6">
                <div className="text-5xl mb-3">😰</div>
                <h3 className="font-bold text-lg mb-2 text-red-700">Forgotten Ideas</h3>
                <p className="text-sm text-gray-700">
                  You see the perfect gift online or in conversation, but when the birthday comes, you've completely forgotten about it.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
              <CardContent className="p-6">
                <div className="text-5xl mb-3">🗂️</div>
                <h3 className="font-bold text-lg mb-2 text-orange-700">Scattered Notes</h3>
                <p className="text-sm text-gray-700">
                  Gift ideas are spread across screenshots, notes apps, bookmarks, and texts - impossible to find when you need them.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200">
              <CardContent className="p-6">
                <div className="text-5xl mb-3">⏰</div>
                <h3 className="font-bold text-lg mb-2 text-yellow-700">Last-Minute Stress</h3>
                <p className="text-sm text-gray-700">
                  Important dates sneak up on you, forcing rushed, impersonal gift decisions and unnecessary stress.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech-stack" className="container px-4 py-12 md:px-6 max-w-6xl mx-auto scroll-mt-32">
        <div className="text-center mb-8">
          <Code className="h-16 w-16 mx-auto mb-4 text-giftstash-blue" />
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Built with Modern Technology
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            GiftStash is powered by cutting-edge tech for speed, security, and scalability
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
            <CardContent className="p-6">
              <div className="text-4xl mb-3">⚛️</div>
              <h3 className="font-bold text-lg mb-2 text-blue-700">Frontend</h3>
              <p className="text-sm text-gray-700 mb-2">
                Next.js 14, React, TypeScript
              </p>
              <p className="text-xs text-gray-600">
                Lightning-fast, type-safe user interface with server-side rendering
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
            <CardContent className="p-6">
              <div className="text-4xl mb-3">🗄️</div>
              <h3 className="font-bold text-lg mb-2 text-green-700">Database</h3>
              <p className="text-sm text-gray-700 mb-2">
                Supabase (PostgreSQL)
              </p>
              <p className="text-xs text-gray-600">
                Real-time database with row-level security and instant sync
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
            <CardContent className="p-6">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="font-bold text-lg mb-2 text-purple-700">AI Engine</h3>
              <p className="text-sm text-gray-700 mb-2">
                Claude AI (Anthropic)
              </p>
              <p className="text-xs text-gray-600">
                Intelligent gift suggestions powered by advanced language models
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
            <CardContent className="p-6">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="font-bold text-lg mb-2 text-orange-700">SMS Integration</h3>
              <p className="text-sm text-gray-700 mb-2">
                Twilio API
              </p>
              <p className="text-xs text-gray-600">
                Instant gift capture via text message with AI parsing
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200">
            <CardContent className="p-6">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="font-bold text-lg mb-2 text-red-700">Security</h3>
              <p className="text-sm text-gray-700 mb-2">
                Auth, RLS, Encryption
              </p>
              <p className="text-xs text-gray-600">
                Bank-level security with row-level access controls
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200">
            <CardContent className="p-6">
              <div className="text-4xl mb-3">☁️</div>
              <h3 className="font-bold text-lg mb-2 text-yellow-700">Infrastructure</h3>
              <p className="text-sm text-gray-700 mb-2">
                Vercel Edge Network
              </p>
              <p className="text-xs text-gray-600">
                Global CDN for instant load times worldwide
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Who We Serve */}
      <section id="who-we-serve" className="container px-4 py-12 md:px-6 max-w-6xl mx-auto scroll-mt-32">
        <div className="text-center mb-12">
          <Users className="h-16 w-16 mx-auto mb-4 text-giftstash-orange" />
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Who We Serve
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            GiftStash is designed for anyone who cares about thoughtful gift-giving
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="text-5xl mb-4">🤗</div>
              <h3 className="text-xl font-bold mb-2 text-giftstash-orange">The Thoughtful Friend</h3>
              <p className="text-sm text-gray-700 mb-3">
                You want to remember perfect gift ideas but they slip away before special occasions
              </p>
              <p className="text-xs font-semibold text-giftstash-orange">
                Solution: SMS capture for instant saving
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="text-5xl mb-4">🛍️</div>
              <h3 className="text-xl font-bold mb-2 text-giftstash-blue">The Online Shopper</h3>
              <p className="text-sm text-gray-700 mb-3">
                You browse constantly and see great gifts but forget to bookmark them
              </p>
              <p className="text-xs font-semibold text-giftstash-blue">
                Solution: One-click Chrome extension
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="text-5xl mb-4">👨‍👩‍👧‍👦</div>
              <h3 className="text-xl font-bold mb-2 text-purple-600">The Budget-Conscious Parent</h3>
              <p className="text-sm text-gray-700 mb-3">
                You have many people to shop for and need to track spending carefully
              </p>
              <p className="text-xs font-semibold text-purple-600">
                Solution: Budget tracking & analytics
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-200 hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="text-5xl mb-4">⏱️</div>
              <h3 className="text-xl font-bold mb-2 text-pink-600">The Last-Minute Scrambler</h3>
              <p className="text-sm text-gray-700 mb-3">
                You often forget birthdays until it's too late and need quick ideas
              </p>
              <p className="text-xs font-semibold text-pink-600">
                Solution: Birthday reminders & AI suggestions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-2 text-green-600">The Meticulous Planner</h3>
              <p className="text-sm text-gray-700 mb-3">
                You love organizing and want complete control over gift tracking
              </p>
              <p className="text-xs font-semibold text-green-600">
                Solution: Detailed status workflow & history
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="text-5xl mb-4">💼</div>
              <h3 className="text-xl font-bold mb-2 text-yellow-600">The Professional</h3>
              <p className="text-sm text-gray-700 mb-3">
                You need to track gifts for clients, colleagues, and team members
              </p>
              <p className="text-xs font-semibold text-yellow-600">
                Solution: Unlimited recipients & categories
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Day in the Life Section */}
      <section id="day-in-life" className="container px-4 py-12 md:px-6 max-w-6xl mx-auto scroll-mt-32">
        <div className="text-center mb-8">
          <Lightbulb className="h-16 w-16 mx-auto mb-4 text-purple-600" />
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            A Day in the Life with{' '}
            <span className="bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
              GiftStash
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how real people use GiftStash throughout their day
          </p>
        </div>

        <Card className="overflow-hidden bg-white border-2 border-gray-200 shadow-2xl">
          <div className="relative bg-gradient-to-br from-orange-50 to-blue-50 p-4 md:p-8">
            <Image
              src={currentStory.image}
              alt={`${currentStory.title} - ${currentStory.subtitle}`}
              width={1600}
              height={900}
              className="w-full h-auto rounded-lg"
              priority
            />
          </div>

          <CardContent className="p-6 md:p-8 bg-gradient-to-r from-giftstash-orange/5 to-giftstash-blue/5">
            <div className="flex flex-col gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
                    {currentStory.title}
                  </h3>
                  <span className="px-3 py-1 bg-gradient-to-r from-giftstash-orange to-giftstash-blue text-white text-xs font-semibold rounded-full">
                    {currentStory.persona}
                  </span>
                </div>
                <p className="text-lg md:text-xl text-gray-600 mb-2">
                  {currentStory.subtitle}
                </p>
                <p className="text-gray-700">
                  {currentStory.description}
                </p>
              </div>

              <Button
                onClick={handleNextStory}
                className="w-full md:w-auto bg-gradient-to-r from-giftstash-orange to-giftstash-blue hover:from-giftstash-orange-light hover:to-giftstash-blue-light"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                See Another Day in the Life
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Values */}
      <section className="container px-4 py-12 md:px-6 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12 border-2 border-blue-200">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            Our Core Values
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-giftstash-orange to-giftstash-blue flex items-center justify-center text-white font-bold text-xl">
                💝
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Thoughtfulness First</h3>
                <p className="text-gray-700">
                  We believe every gift should be meaningful. Our tools help you remember the details that make gifts special.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-giftstash-orange to-giftstash-blue flex items-center justify-center text-white font-bold text-xl">
                🚀
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Frictionless Experience</h3>
                <p className="text-gray-700">
                  Capture ideas in seconds via SMS, extension, or web. We meet you where you are, not the other way around.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-giftstash-orange to-giftstash-blue flex items-center justify-center text-white font-bold text-xl">
                🔒
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Privacy & Security</h3>
                <p className="text-gray-700">
                  Your gift ideas are personal. We use bank-level encryption and never share or sell your data.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-giftstash-orange to-giftstash-blue flex items-center justify-center text-white font-bold text-xl">
                🎯
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Continuous Improvement</h3>
                <p className="text-gray-700">
                  We're constantly adding features based on user feedback. Your voice shapes the product.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container px-4 py-16 md:px-6 max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-giftstash-orange to-giftstash-blue rounded-3xl p-8 md:p-12 text-white shadow-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join the GiftStash Community
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Thousands of people already use GiftStash to give better gifts. Start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-giftstash-orange hover:bg-gray-100 text-lg px-8 py-6">
                Sign Up Free
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                Learn How It Works
              </Button>
            </Link>
          </div>
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
            <p className="text-sm text-gray-600">
              © 2025 GiftStash. Never forget a gift idea again.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
