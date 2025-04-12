'use client';

/**
 * @fileoverview Custom 404 error page
 */

import { useState, useEffect } from 'react';
import { Header } from '@/components/custom';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';
import Link from 'next/link';

/**
 * NotFound component for handling 404 errors
 * @returns {React.ReactNode} The rendered NotFound page
 */
const NotFound = (): React.ReactNode => {
  // Track component mounting for client-side features
  const [isPageMounted, setIsPageMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsPageMounted(true);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {isPageMounted && <Header />}

      <main className="flex-1 container py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6">
            <Search className="w-10 h-10 text-accent" />
          </div>

          <h1 className="text-4xl font-semibold mb-3">Page Not Found</h1>
          <p className="text-secondary text-lg max-w-md mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>

          {/* Navigation buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              className="gap-2 border-accent text-accent hover:bg-accent/10"
              asChild
              variant="outline"
            >
              <Link href="/">
                <Home className="w-4 h-4" />
                Return Home
              </Link>
            </Button>

            {/* TODO: Check if user should be redirected to dashboard when not authenticated?? */}
            <Button
              className="gap-2 bg-accent hover:bg-accent/90 text-white"
              asChild
            >
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
