// Kiosk layout - Full screen with no navigation
// This overrides the root layout for all /kiosk/* routes
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Family Hub - Kiosk Mode',
  description: 'Full-screen kiosk display for family checklists and accountability',
};

export default function KioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* No header, no footer - just the content */}
        <main className="min-h-screen">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
