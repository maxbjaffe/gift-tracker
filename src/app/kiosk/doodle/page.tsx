'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DoodleBoard } from '@/components/kiosk/DoodleBoard';
import { Home, ArrowLeft } from 'lucide-react';

function DoodleKioskContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={token ? `/kiosk/dashboard?token=${token}` : '/kiosk/dashboard'}>
              <Button variant="outline" size="lg" className="gap-2">
                <ArrowLeft className="h-5 w-5" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Doodle Time! 🎨
          </div>
        </div>

        {/* Full Screen Doodle Board */}
        <DoodleBoard />
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
