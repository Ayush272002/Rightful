'use client';

/**
 * @fileoverview Client-side authentication and authorisation guard for user-only pages
 */

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAccount } from 'wagmi';
import WalletConnect from '@/components/WalletConnect';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard component that checks user authentication using MetaMask
 * @param {AuthGuardProps} props - The component props
 * @param {React.ReactNode} props.children - The child components to render as the page content
 * @returns {React.ReactNode} The child components if user is authenticated
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { address, isConnected } = useAccount();
  const [authState, setAuthState] = useState<{
    isLoading: boolean;
    isAuthenticated: boolean;
    error?: string;
  }>({
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    setAuthState({
      isLoading: false,
      isAuthenticated: isConnected && !!address,
      error: !isConnected ? 'Please connect your MetaMask wallet' : undefined,
    });
  }, [isConnected, address]);

  if (authState.isLoading) {
    return (
      <div
        className="min-h-screen bg-brand-50 flex items-center justify-center"
        role="status"
        aria-label="Checking authentication"
        aria-live="polite"
      >
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">
            Loading...
          </h2>
        </div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <div
        className="min-h-screen bg-brand-50 flex items-center justify-center"
        role="main"
        aria-labelledby="auth-required-title"
      >
        <div className="text-center p-8">
          <h2
            id="auth-required-title"
            className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-700 mb-6"
          >
            Wallet Not Connected
          </h2>
          <p
            className="mb-8 text-base sm:text-lg text-muted-foreground"
            role="alert"
            aria-live="assertive"
          >
            {authState.error ||
              'Please connect your MetaMask wallet to access this page.'}
          </p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
