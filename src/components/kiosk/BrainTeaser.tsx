'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Eye, EyeOff } from 'lucide-react';

interface BrainTeaserProps {
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const BRAIN_TEASERS = [
  { question: "I'm tall when I'm young, and I'm short when I'm old. What am I?", answer: "A candle!", difficulty: 'easy' },
  { question: "What has keys but no locks, space but no room, and you can enter but can't go inside?", answer: "A keyboard!", difficulty: 'medium' },
  { question: "What gets wetter the more it dries?", answer: "A towel!", difficulty: 'easy' },
  { question: "What has hands but can't clap?", answer: "A clock!", difficulty: 'easy' },
  { question: "What comes down but never goes up?", answer: "Rain!", difficulty: 'easy' },
  { question: "I have cities but no houses, forests but no trees, and water but no fish. What am I?", answer: "A map!", difficulty: 'medium' },
  { question: "What can travel around the world while staying in a corner?", answer: "A stamp!", difficulty: 'medium' },
  { question: "The more you take, the more you leave behind. What am I?", answer: "Footsteps!", difficulty: 'medium' },
  { question: "What has a head and a tail but no body?", answer: "A coin!", difficulty: 'easy' },
  { question: "What begins with T, ends with T, and has T in it?", answer: "A teapot!", difficulty: 'medium' },
  { question: "What runs but never walks, has a mouth but never talks?", answer: "A river!", difficulty: 'medium' },
  { question: "If you drop me, I'm sure to crack, but smile at me and I'll smile back. What am I?", answer: "A mirror!", difficulty: 'easy' },
  { question: "What goes up but never comes down?", answer: "Your age!", difficulty: 'easy' },
  { question: "I'm light as a feather, but even the strongest person can't hold me for long. What am I?", answer: "Your breath!", difficulty: 'medium' },
  { question: "What has 88 keys but can't open a single door?", answer: "A piano!", difficulty: 'medium' },
  { question: "What word becomes shorter when you add two letters to it?", answer: "Short! (Add 'er' to make 'shorter')", difficulty: 'hard' },
  { question: "What is so delicate that saying its name breaks it?", answer: "Silence!", difficulty: 'medium' },
  { question: "What can you catch but never throw?", answer: "A cold!", difficulty: 'easy' },
  { question: "I have a neck but no head. What am I?", answer: "A bottle!", difficulty: 'easy' },
  { question: "What has four legs in the morning, two legs in the afternoon, and three legs in the evening?", answer: "A human! (Crawling as baby, walking as adult, using cane when old)", difficulty: 'hard' },
  { question: "What building has the most stories?", answer: "A library!", difficulty: 'easy' },
  { question: "What can fill a room but takes up no space?", answer: "Light!", difficulty: 'medium' },
  { question: "What goes through cities and fields but never moves?", answer: "A road!", difficulty: 'medium' },
  { question: "I am always in front of you but can't be seen. What am I?", answer: "The future!", difficulty: 'medium' },
  { question: "What has one eye but can't see?", answer: "A needle!", difficulty: 'easy' },
  { question: "What month has 28 days?", answer: "All of them!", difficulty: 'easy' },
  { question: "What is full of holes but still holds water?", answer: "A sponge!", difficulty: 'easy' },
  { question: "What question can you never answer yes to?", answer: "Are you asleep?", difficulty: 'medium' },
  { question: "What has teeth but can't bite?", answer: "A comb!", difficulty: 'easy' },
  { question: "What kind of band never plays music?", answer: "A rubber band!", difficulty: 'easy' },
];

export function BrainTeaser({ dayOfYear }: { dayOfYear: number }) {
  const [revealed, setRevealed] = useState(false);

  // Select brain teaser based on day of year
  const teaser = BRAIN_TEASERS[dayOfYear % BRAIN_TEASERS.length];

  const difficultyColors = {
    easy: 'text-green-600',
    medium: 'text-yellow-600',
    hard: 'text-red-600',
  };

  const difficultyBgColors = {
    easy: 'bg-green-100 border-green-300',
    medium: 'bg-yellow-100 border-yellow-300',
    hard: 'bg-red-100 border-red-300',
  };

  return (
    <Card
      className={`shadow-lg hover:shadow-2xl transition-all hover:scale-105 duration-300 border-4 cursor-pointer ${difficultyBgColors[teaser.difficulty]}`}
      onClick={() => setRevealed(!revealed)}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600 animate-pulse" />
            <span className="text-transparent bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text font-black text-xl">
              Daily Brain Teaser
            </span>
          </div>
          <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${difficultyColors[teaser.difficulty]}`}>
            {teaser.difficulty}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-lg font-bold text-gray-800 leading-relaxed">
            {teaser.question}
          </p>

          <div
            className={`relative p-4 rounded-xl border-l-8 border-purple-500 transition-all duration-300 ${
              revealed
                ? 'bg-white shadow-lg scale-100 opacity-100'
                : 'bg-gray-200 shadow-sm scale-95 opacity-50'
            }`}
          >
            {revealed ? (
              <div className="flex items-start gap-3">
                <Eye className="h-5 w-5 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-bold text-purple-700 mb-1">Answer:</p>
                  <p className="text-lg font-black text-purple-900">
                    {teaser.answer}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 justify-center">
                <EyeOff className="h-5 w-5 text-gray-600" />
                <p className="text-gray-600 font-bold">
                  Tap to reveal answer!
                </p>
              </div>
            )}
          </div>

          {revealed && (
            <div className="text-center">
              <div className="inline-block animate-bounce">
                <span className="text-4xl">🧠✨</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
