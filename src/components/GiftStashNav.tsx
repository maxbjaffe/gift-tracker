'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Home, Gift, Users, LogOut } from 'lucide-react';

export function GiftStashNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/gifts', label: 'Gifts', icon: Gift },
    { href: '/recipients', label: 'Recipients', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 max-w-7xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/images/GiftStashIconGSv2.png"
            alt="GiftStash"
            width={40}
            height={40}
            className="h-10 w-10"
          />
          <span className="text-xl font-bold bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent hidden sm:inline">
            GiftStash
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className={
                    isActive
                      ? 'bg-gradient-to-r from-giftstash-orange to-giftstash-blue text-white'
                      : 'text-gray-700'
                  }
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Navigation */}
        <nav className="flex md:hidden items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className={
                    isActive
                      ? 'bg-gradient-to-r from-giftstash-orange to-giftstash-blue text-white'
                      : 'text-gray-700'
                  }
                >
                  <Icon className="h-4 w-4" />
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-gray-700">
          <LogOut className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
}
