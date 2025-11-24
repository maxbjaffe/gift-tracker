'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ProductTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tourSlides = [
  {
    title: 'Welcome to GiftStash!',
    description: 'Take a quick tour to see how GiftStash transforms gift-giving into a seamless experience',
    image: '/images/GSValueImages/GiftStashvisualframework.png',
    alt: 'GiftStash Complete Solution Framework',
  },
  {
    title: 'The Gift Idea Management Lifecycle',
    description: 'From capturing ideas to tracking progress - see how GiftStash guides you through every step',
    image: '/images/GSValueImages/GiftStashEduOverview.png',
    alt: 'Gift Idea Management Lifecycle - 4 stages',
  },
  {
    title: 'Your Onboarding Journey',
    description: 'From signup to your first saved gift in under 5 minutes - it\'s that simple!',
    image: '/images/GSValueImages/Giftstashuserjourney.png',
    alt: 'User Journey Onboarding Flow',
  },
  {
    title: 'Multi-Channel Capture & AI Intelligence',
    description: 'Save ideas via SMS, Chrome extension, or web dashboard - all powered by AI',
    image: '/images/GSValueImages/GiftStashVCPitchFormat.png',
    alt: 'Multi-Channel Capture Framework',
  },
  {
    title: 'Technical Excellence',
    description: 'Built with cutting-edge technology for speed, security, and reliability',
    image: '/images/GSValueImages/GiftStashProductWorkflow.png',
    alt: 'Product Architecture and Data Flow',
  },
];

export function ProductTourModal({ isOpen, onClose }: ProductTourModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < tourSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleClose = () => {
    setCurrentSlide(0);
    onClose();
  };

  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === tourSlides.length - 1;
  const slide = tourSlides[currentSlide];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        <div className="relative">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
            aria-label="Close tour"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>

          {/* Content */}
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
                {slide.title}
              </DialogTitle>
              <p className="text-center text-gray-600 text-lg mt-2">
                {slide.description}
              </p>
            </DialogHeader>

            {/* Image */}
            <div className="bg-gradient-to-br from-orange-50 to-blue-50 rounded-xl p-6 mb-6">
              <Image
                src={slide.image}
                alt={slide.alt}
                width={1600}
                height={900}
                className="w-full h-auto rounded-lg"
                priority={currentSlide === 0}
              />
            </div>

            {/* Progress Indicators */}
            <div className="flex justify-center gap-2 mb-6">
              {tourSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? 'w-8 bg-gradient-to-r from-giftstash-orange to-giftstash-blue'
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center gap-4">
              <Button
                variant="outline"
                onClick={prevSlide}
                disabled={isFirstSlide}
                className="flex-1"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="text-sm text-gray-600 font-medium">
                {currentSlide + 1} / {tourSlides.length}
              </div>

              {!isLastSlide ? (
                <Button
                  onClick={nextSlide}
                  className="flex-1 bg-gradient-to-r from-giftstash-orange to-giftstash-blue hover:from-giftstash-orange-light hover:to-giftstash-blue-light"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleClose}
                  className="flex-1 bg-gradient-to-r from-giftstash-orange to-giftstash-blue hover:from-giftstash-orange-light hover:to-giftstash-blue-light"
                >
                  Get Started!
                </Button>
              )}
            </div>

            {/* Skip Tour */}
            {!isLastSlide && (
              <div className="text-center mt-4">
                <button
                  onClick={handleClose}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Skip Tour
                </button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
