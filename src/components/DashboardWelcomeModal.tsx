'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ProductTourModal } from './ProductTourModal';
import { X, Sparkles } from 'lucide-react';

interface DashboardWelcomeModalProps {
  autoShow?: boolean;
}

export function DashboardWelcomeModal({ autoShow = true }: DashboardWelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (autoShow) {
      // Check if user has seen welcome modal before
      const hasSeenWelcome = localStorage.getItem('giftstash-seen-welcome');

      if (!hasSeenWelcome) {
        // Show after a brief delay for better UX
        setTimeout(() => {
          setIsOpen(true);
        }, 500);
      }
    }
  }, [autoShow]);

  const handleClose = () => {
    localStorage.setItem('giftstash-seen-welcome', 'true');
    setIsOpen(false);
  };

  const handleTakeTour = () => {
    localStorage.setItem('giftstash-seen-welcome', 'true');
    setIsOpen(false);
    setShowTour(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
            aria-label="Close welcome"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>

          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-giftstash-orange to-giftstash-blue p-8 text-white text-center">
            <Sparkles className="h-16 w-16 mx-auto mb-4" />
            <DialogHeader>
              <DialogTitle className="text-4xl font-bold text-white mb-2">
                Welcome to GiftStash!
              </DialogTitle>
              <p className="text-xl opacity-95">
                You're all set to start saving gift ideas
              </p>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Quick Start Visual */}
            <div className="bg-gradient-to-br from-orange-50 to-blue-50 rounded-xl p-6 mb-6">
              <Image
                src="/images/GSValueImages/Giftstashuserjourney.png"
                alt="Your GiftStash Journey"
                width={1200}
                height={600}
                className="w-full h-auto rounded-lg"
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border-2 border-orange-200">
                <div className="text-4xl mb-2">📱</div>
                <h3 className="font-bold text-sm mb-1">Text to Save</h3>
                <p className="text-xs text-gray-600">
                  Add GiftStash to contacts & text gift ideas
                </p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
                <div className="text-4xl mb-2">🧩</div>
                <h3 className="font-bold text-sm mb-1">Browse & Save</h3>
                <p className="text-xs text-gray-600">
                  Install Chrome extension for one-click saves
                </p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200">
                <div className="text-4xl mb-2">🤖</div>
                <h3 className="font-bold text-sm mb-1">AI Suggestions</h3>
                <p className="text-xs text-gray-600">
                  Get personalized gift recommendations
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleTakeTour}
                className="flex-1 bg-gradient-to-r from-giftstash-orange to-giftstash-blue hover:from-giftstash-orange-light hover:to-giftstash-blue-light text-lg py-6"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Take the Product Tour
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1 text-lg py-6 border-2"
              >
                Start Exploring
              </Button>
            </div>

            {/* Skip */}
            <p className="text-center text-sm text-gray-500 mt-4">
              You can always access the tour from the dashboard
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <ProductTourModal isOpen={showTour} onClose={() => setShowTour(false)} />
    </>
  );
}
