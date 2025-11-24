'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { UserMenu } from '@/components/shared/UserMenu';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Home, Gift, Users, Info, BarChart3 } from 'lucide-react';

export function GiftStashNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Get initial user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/gifts', label: 'Gifts', icon: Gift },
    { href: '/recipients', label: 'Recipients', icon: Users },
    { href: '/about', label: 'About', icon: Info },
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

        {/* User Account Menu */}
        <UserMenu user={user} />
      </div>
    </header>
  );
}
