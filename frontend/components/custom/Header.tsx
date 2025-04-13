'use client';

/**
 * @fileoverview Header component for Rightful platform.
 * Implements responsive navigation with mobile menu support.
 *
 * @todo Implement mobile menu functionality
 * @todo Add active state styling for navigation links
 * @todo Consider adding dropdown menus for Documentation
 */

import { Button } from '@/components/ui/button';
import { Shield, Menu } from 'lucide-react';
import WalletConnect from '@/components/WalletConnect';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';

// Constants for navigation items (Dashboard link will be conditionally shown)
const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'How It Works', href: '/#how-it-works' }, // Changed to include root path
  { label: 'Documentation', href: '#docs' },
] as const;

export function Header() {
  const router = useRouter();
  const { isConnected } = useAccount();

  return (
    <header className="border-b border-border bg-white">
      <div className="container py-4 flex items-center justify-between">
        {/* Brand logo and icon */}
        <div
          className="flex items-center space-x-3 hover:cursor-pointer"
          onClick={() => {
            router.push('/');
          }}
        >
          <Shield className="w-5 h-5 text-primary/80" />
          <span className="brand-logo font-dm-serif">Rightful AI</span>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {NAV_ITEMS.map((item) => {
            if (item.label === 'Dashboard' && !isConnected) {
              return null;
            }
            return (
              <a
                key={item.label}
                href={item.href}
                className="text-secondary hover:text-primary text-sm font-medium transition-colors"
              >
                {item.label}
              </a>
            );
          })}

          {/* Authentication buttons */}
          <WalletConnect />
        </nav>

        {/* Mobile menu button */}
        <Button
          className="md:hidden"
          size="sm"
          variant="ghost"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
