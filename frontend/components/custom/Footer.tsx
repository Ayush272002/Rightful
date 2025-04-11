'use client'

/**
 * @fileoverview Simplified Footer component for Rightful platform
 * Single line layout with brand name, legal links and copyright information
 */

import { Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '#privacy' },
  { label: 'Terms of Service', href: '#terms' },
  { label: 'Cookie Policy', href: '#cookies' },
] as const;

export function Footer() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border py-6 mt-auto">
      <div className="container">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center space-x-2 hover:cursor-pointer" onClick={() => { router.push("/") }}>
            <Shield className="w-4 h-4 text-primary/80" />
            <span className="text-sm font-medium">Rightful</span>
          </div>

          {/* Legal links */}
          <div className="flex flex-wrap items-center gap-6">
            {LEGAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs text-secondary hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-xs text-secondary">
            © {currentYear} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
