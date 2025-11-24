'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
];

export function DayInLifeCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance every 8 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % dayInLifeStories.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % dayInLifeStories.length);
  };

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + dayInLifeStories.length) % dayInLifeStories.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  const currentStory = dayInLifeStories[currentIndex];

  return (
    <div className="relative">
      {/* Main Story Display */}
      <Card className="overflow-hidden bg-white border-2 border-gray-200 shadow-2xl">
        <div className="relative">
          {/* Story Image */}
          <div className="relative bg-gradient-to-br from-orange-50 to-blue-50 p-4 md:p-8">
            <Image
              src={currentStory.image}
              alt={`${currentStory.title} - ${currentStory.subtitle}`}
              width={1600}
              height={900}
              className="w-full h-auto rounded-lg"
              priority={currentIndex === 0}
            />
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrev}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110 z-10"
            aria-label="Previous story"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-gray-700" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110 z-10"
            aria-label="Next story"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-gray-700" />
          </button>
        </div>

        {/* Story Info */}
        <div className="p-6 md:p-8 bg-gradient-to-r from-giftstash-orange/5 to-giftstash-blue/5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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

            {/* Progress Indicators */}
            <div className="flex gap-2 md:flex-col md:gap-3">
              {dayInLifeStories.map((story, index) => (
                <button
                  key={story.id}
                  onClick={() => goToSlide(index)}
                  className={`transition-all ${
                    index === currentIndex
                      ? 'w-12 md:w-3 md:h-12 h-3 bg-gradient-to-r from-giftstash-orange to-giftstash-blue'
                      : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                  } rounded-full`}
                  aria-label={`Go to ${story.title}`}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Auto-play indicator */}
      {isAutoPlaying && (
        <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 text-white text-xs rounded-full flex items-center gap-2">
          <div className="w-2 h-2 bg-giftstash-orange rounded-full animate-pulse"></div>
          Auto-playing
        </div>
      )}
    </div>
  );
}
