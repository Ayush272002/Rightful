'use client';

import { AuthGuard } from '@/components/custom/AuthGuard';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">{children}</div>
    </AuthGuard>
  );
}
