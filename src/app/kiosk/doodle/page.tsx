'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DoodleBoard } from '@/components/kiosk/DoodleBoard';
import { DoodleGallery } from '@/components/kiosk/DoodleGallery';
import { Home, ArrowLeft, ImageIcon, Paintbrush } from 'lucide-react';

function DoodleKioskContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || null;
  const [view, setView] = useState<'draw' | 'gallery'>('draw');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link href={token ? `/kiosk/dashboard?token=${token}` : '/kiosk/dashboard'}>
              <Button variant="outline" size="lg" className="gap-2">
                <ArrowLeft className="h-5 w-5" />
                Back
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button
                variant={view === 'draw' ? 'default' : 'outline'}
                size="lg"
                onClick={() => setView('draw')}
                className="gap-2"
              >
                <Paintbrush className="h-5 w-5" />
                Draw
              </Button>
              <Button
                variant={view === 'gallery' ? 'default' : 'outline'}
                size="lg"
                onClick={() => setView('gallery')}
                className="gap-2"
              >
                <ImageIcon className="h-5 w-5" />
                Gallery
              </Button>
            </div>
          </div>
          <div className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {view === 'draw' ? 'Doodle Time! 🎨' : 'Art Gallery 🖼️'}
          </div>
        </div>

        {/* Content */}
        {view === 'draw' ? <DoodleBoard /> : <DoodleGallery />}
      </div>
    </div>
  );
}

export default function DoodleKioskPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600 font-bold">Loading...</div>
      </div>
    }>
      <DoodleKioskContent />
    </Suspense>
  );
}
