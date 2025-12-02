'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { isPWAEnabled } from '@/lib/app-config'
import { isRunningAsPWA, canInstallPWA } from '@/components/pwa/PWAProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  CheckCircle2,
  Circle,
  Download,
  Smartphone,
  Chrome,
  ArrowRight,
  MessageSquare,
  ExternalLink,
} from 'lucide-react'

type SetupStep = 'contact' | 'pwa' | 'extension'

interface StepStatus {
  contact: 'pending' | 'completed' | 'skipped'
  pwa: 'pending' | 'completed' | 'skipped' | 'not-available'
  extension: 'pending' | 'completed' | 'skipped' | 'not-available'
}

export default function SetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState<SetupStep>('contact')
  const [stepStatus, setStepStatus] = useState<StepStatus>({
    contact: 'pending',
    pwa: 'pending',
    extension: 'pending',
  })
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [isChrome, setIsChrome] = useState(false)
  const [downloadStarted, setDownloadStarted] = useState(false)

  useEffect(() => {
    checkAuth()
    detectEnvironment()
  }, [])

  const checkAuth = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    setLoading(false)
  }

  const detectEnvironment = () => {
    // Check if already installed as PWA
    const isPWA = isRunningAsPWA()
    setIsInstalled(isPWA)

    // Check if can install PWA
    setCanInstall(canInstallPWA())

    // Check if desktop
    const isDesktopDevice = window.innerWidth >= 1024 && !('ontouchstart' in window)
    setIsDesktop(isDesktopDevice)

    // Check if Chrome (for extension)
    const isChromeBrowser = /Chrome/.test(navigator.userAgent) && !/Edge|Edg/.test(navigator.userAgent)
    setIsChrome(isChromeBrowser)

    // Update step availability
    setStepStatus(prev => ({
      ...prev,
      pwa: isPWA ? 'completed' : (isPWAEnabled() ? 'pending' : 'not-available'),
      extension: isDesktopDevice && isChromeBrowser ? 'pending' : 'not-available',
    }))
  }

  const handleDownloadVCard = () => {
    setDownloadStarted(true)
    // Trigger download
    window.location.href = '/api/contact/vcard'
    // Mark as completed after a delay (user has initiated download)
    setTimeout(() => {
      setStepStatus(prev => ({ ...prev, contact: 'completed' }))
      // Move to next available step
      if (stepStatus.pwa !== 'not-available' && stepStatus.pwa !== 'completed') {
        setCurrentStep('pwa')
      } else if (stepStatus.extension !== 'not-available') {
        setCurrentStep('extension')
      }
    }, 1000)
  }

  const handleSkipStep = (step: SetupStep) => {
    setStepStatus(prev => ({ ...prev, [step]: 'skipped' }))

    // Move to next step
    if (step === 'contact') {
      if (stepStatus.pwa !== 'not-available') {
        setCurrentStep('pwa')
      } else if (stepStatus.extension !== 'not-available') {
        setCurrentStep('extension')
      }
    } else if (step === 'pwa') {
      if (stepStatus.extension !== 'not-available') {
        setCurrentStep('extension')
      }
    }
  }

  const handlePWAInstalled = () => {
    setStepStatus(prev => ({ ...prev, pwa: 'completed' }))
    if (stepStatus.extension !== 'not-available') {
      setCurrentStep('extension')
    }
  }

  const handleExtensionStep = () => {
    setStepStatus(prev => ({ ...prev, extension: 'completed' }))
  }

  const allStepsComplete = () => {
    return Object.entries(stepStatus).every(
      ([_, status]) => status === 'completed' || status === 'skipped' || status === 'not-available'
    )
  }

  const getStepIcon = (step: SetupStep) => {
    const status = stepStatus[step]
    if (status === 'completed') {
      return <CheckCircle2 className="h-6 w-6 text-green-500" />
    }
    if (status === 'skipped' || status === 'not-available') {
      return <Circle className="h-6 w-6 text-gray-300" />
    }
    if (currentStep === step) {
      return <Circle className="h-6 w-6 text-purple-500 fill-purple-100" />
    }
    return <Circle className="h-6 w-6 text-gray-300" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-pulse text-4xl">🎁</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/GiftStashIconGSv2.png"
              alt="GiftStash"
              width={80}
              height={80}
              className="h-20 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Get the Full Experience
          </h1>
          <p className="text-gray-600">
            Set up GiftStash for the best gift-tracking experience
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            {getStepIcon('contact')}
            <div className={`h-1 w-12 ${stepStatus.contact === 'completed' ? 'bg-green-500' : 'bg-gray-200'} rounded`} />
            {getStepIcon('pwa')}
            <div className={`h-1 w-12 ${stepStatus.pwa === 'completed' ? 'bg-green-500' : 'bg-gray-200'} rounded`} />
            {getStepIcon('extension')}
          </div>
        </div>

        {/* Step Cards */}
        <div className="space-y-4">
          {/* Step 1: Contact Card */}
          <Card className={`transition-all ${currentStep === 'contact' ? 'ring-2 ring-purple-500 shadow-lg' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">Save Contact Card</h3>
                    {stepStatus.contact === 'completed' && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Add GiftStash to your contacts to easily text gift ideas anytime.
                    Just text us any gift idea and we'll save it for you!
                  </p>

                  {currentStep === 'contact' && stepStatus.contact === 'pending' && (
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={handleDownloadVCard}
                        className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <Download className="h-4 w-4" />
                        {downloadStarted ? 'Opening...' : 'Download Contact'}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleSkipStep('contact')}
                        className="text-gray-500"
                      >
                        Skip for now
                      </Button>
                    </div>
                  )}

                  {stepStatus.contact === 'completed' && (
                    <p className="text-sm text-green-600">Contact card downloaded!</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: PWA Install */}
          {stepStatus.pwa !== 'not-available' && (
            <Card className={`transition-all ${currentStep === 'pwa' ? 'ring-2 ring-purple-500 shadow-lg' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">Install App</h3>
                      {stepStatus.pwa === 'completed' && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Add GiftStash to your home screen for quick access and
                      the ability to share gift ideas directly from any app.
                    </p>

                    {currentStep === 'pwa' && stepStatus.pwa === 'pending' && (
                      <>
                        {isInstalled ? (
                          <p className="text-sm text-green-600">Already installed!</p>
                        ) : (
                          <div className="space-y-3">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-sm text-blue-800">
                                <strong>To install:</strong>
                              </p>
                              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                                {/iPhone|iPad/.test(navigator.userAgent) ? (
                                  <>
                                    <li>1. Tap the Share button (box with arrow)</li>
                                    <li>2. Scroll and tap "Add to Home Screen"</li>
                                    <li>3. Tap "Add" to confirm</li>
                                  </>
                                ) : (
                                  <>
                                    <li>1. Look for the install icon in your browser's address bar</li>
                                    <li>2. Or tap the menu and select "Install app"</li>
                                  </>
                                )}
                              </ul>
                            </div>
                            <div className="flex flex-wrap gap-3">
                              <Button
                                onClick={handlePWAInstalled}
                                variant="outline"
                                className="gap-2"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                I've installed it
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => handleSkipStep('pwa')}
                                className="text-gray-500"
                              >
                                Skip for now
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {stepStatus.pwa === 'completed' && (
                      <p className="text-sm text-green-600">App installed!</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Browser Extension (Desktop Chrome only) */}
          {stepStatus.extension !== 'not-available' && (
            <Card className={`transition-all ${currentStep === 'extension' ? 'ring-2 ring-purple-500 shadow-lg' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <Chrome className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">Browser Extension</h3>
                      {stepStatus.extension === 'completed' && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Save gift ideas from any website with one click. Perfect for
                      when you're browsing Amazon, Target, or any online store.
                    </p>

                    {currentStep === 'extension' && stepStatus.extension === 'pending' && (
                      <div className="flex flex-wrap gap-3">
                        <Button
                          asChild
                          className="gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                        >
                          <a
                            href="https://chrome.google.com/webstore"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleExtensionStep}
                          >
                            <ExternalLink className="h-4 w-4" />
                            Get Extension
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleSkipStep('extension')}
                          className="text-gray-500"
                        >
                          Skip for now
                        </Button>
                      </div>
                    )}

                    {stepStatus.extension === 'completed' && (
                      <p className="text-sm text-green-600">Extension step completed!</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Completion / Continue */}
        <div className="mt-8 text-center">
          {allStepsComplete() ? (
            <div className="space-y-4">
              <div className="text-4xl">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900">You're all set!</h2>
              <p className="text-gray-600">Start tracking your gift ideas now.</p>
              <Button
                onClick={() => router.push('/dashboard')}
                size="lg"
                className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link
              href="/dashboard"
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Skip setup and go to dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
