'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  BookOpen,
  Video,
  MessageSquare,
  X,
  ChevronRight,
  Smartphone,
  Chrome,
  Brain
} from 'lucide-react';
import Link from 'next/link';
import { ProductTourModal } from './ProductTourModal';

export function DashboardWelcomeSection() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showTour, setShowTour] = useState(false);

  // Check if user has dismissed this section before
  const isDismissed = typeof window !== 'undefined' &&
    localStorage.getItem('giftstash-dismissed-welcome-section') === 'true';

  if (isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem('giftstash-dismissed-welcome-section', 'true');
    setIsExpanded(false);
  };

  return (
    <>
      <Card className="mb-6 border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-blue-50 shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-r from-giftstash-orange to-giftstash-blue rounded-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
                    Welcome to GiftStash!
                  </h2>
                  <p className="text-sm text-gray-600">
                    Your journey to stress-free gift-giving starts here
                  </p>
                </div>
              </div>

              {isExpanded && (
                <>
                  <p className="text-gray-700 mb-6">
                    Ready to never forget a gift idea again? Explore how GiftStash works and discover the best way to capture, organize, and give perfect gifts.
                  </p>

                  {/* Quick Action Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* SMS Setup */}
                    <button
                      onClick={() => {/* Could open SMS guide */}}
                      className="group text-left p-4 bg-white rounded-lg border-2 border-transparent hover:border-orange-300 transition-all hover:shadow-md"
                    >
                      <Smartphone className="h-8 w-8 text-giftstash-orange mb-2" />
                      <h3 className="font-bold mb-1 text-gray-900 group-hover:text-giftstash-orange transition-colors">
                        Text to Save
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Add GiftStash to contacts and text gift ideas instantly
                      </p>
                      <div className="flex items-center text-xs text-giftstash-orange font-semibold">
                        <a href="/api/contact/vcard" download="GiftStash.vcf">
                          Download vCard
                        </a>
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </div>
                    </button>

                    {/* Chrome Extension */}
                    <button
                      onClick={() => window.open('https://chrome.google.com/webstore', '_blank')}
                      className="group text-left p-4 bg-white rounded-lg border-2 border-transparent hover:border-blue-300 transition-all hover:shadow-md"
                    >
                      <Chrome className="h-8 w-8 text-giftstash-blue mb-2" />
                      <h3 className="font-bold mb-1 text-gray-900 group-hover:text-giftstash-blue transition-colors">
                        Browser Extension
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        One-click save from any website while browsing
                      </p>
                      <div className="flex items-center text-xs text-giftstash-blue font-semibold">
                        Get Extension
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </div>
                    </button>

                    {/* AI Suggestions */}
                    <Link href="/inspiration">
                      <button className="group text-left p-4 bg-white rounded-lg border-2 border-transparent hover:border-purple-300 transition-all hover:shadow-md w-full">
                        <Brain className="h-8 w-8 text-purple-600 mb-2" />
                        <h3 className="font-bold mb-1 text-gray-900 group-hover:text-purple-600 transition-colors">
                          AI Inspiration
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Get personalized gift recommendations powered by AI
                        </p>
                        <div className="flex items-center text-xs text-purple-600 font-semibold">
                          Try It Now
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </div>
                      </button>
                    </Link>
                  </div>

                  {/* Learn More Options */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-orange-200">
                    <Button
                      onClick={() => setShowTour(true)}
                      variant="outline"
                      size="sm"
                      className="border-2"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Take Product Tour
                    </Button>

                    <Link href="/how-it-works">
                      <Button variant="outline" size="sm" className="border-2">
                        <BookOpen className="h-4 w-4 mr-2" />
                        How It Works
                      </Button>
                    </Link>

                    <Link href="/about">
                      <Button variant="outline" size="sm" className="border-2">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        About GiftStash
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 hover:bg-white/50 rounded-full transition-colors"
              aria-label="Dismiss welcome section"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </CardContent>
      </Card>

      <ProductTourModal isOpen={showTour} onClose={() => setShowTour(false)} />
    </>
  );
}
