"use client";
/**
 * @fileoverview Dashboard page for Rightful where existing users can view alerts and manage their documents.
 * The page has the infringement alerts section migrated from the landing page.
 */

import { Button } from '@/components/ui/button';
import { Upload, FileText, BarChart3, AlertCircle } from 'lucide-react';
import { Header, Footer } from '@/components/custom';
import { useEffect, useState } from 'react';

// Dummy hardcoded data for infringement alerts
export default function Dashboard() {
  const [alerts, setAlerts] = useState<{ id: number; title: string; description: string; severity: string }[]>([]);

  useEffect(() => {
    // Hardcoded JSON response simulating backend data.
    const mockAlerts = [
      {
        id: 1,
        title: 'Potential Infringement Detected',
        description: 'Your document matches 85% with a registered patent.',
        severity: 'high',
      },
      {
        id: 2,
        title: 'Similarity Found',
        description: 'A 60% similarity was found with an academic paper.',
        severity: 'medium',
      },
    ];

    // If there is no response or the response is empty, show a green "all clear" alert.
    if (!mockAlerts || mockAlerts.length === 0) {
      setAlerts([
        {
          id: 0,
          title: 'All Clear!',
          description: 'Good News, no similarities or infringements found',
          severity: 'clear',
        },
      ]);
    } else {
      setAlerts(mockAlerts);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="py-16 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="heading-medium mb-4 
            {`${
              alerts.some(alert => alert.severity === 'high' || alert.severity === 'medium')
                ? 'text-black-600'
                : 'text-green-600'
            }`}"
          >
            Intellectual Property Infringement Alerts
          </h2>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${
                  alert.severity === 'high'
                    ? 'border-red-600 bg-red-50'
                    : alert.severity === 'medium'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-green-600 bg-green-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlertCircle
                    className={`w-6 h-6 ${
                      alert.severity === 'high'
                        ? 'text-red-600'
                        : alert.severity === 'medium'
                        ? 'text-yellow-500'
                        : 'text-green-600'
                    }`}
                  />
                  <h3
                    className={`text-lg font-medium ${
                      alert.severity === 'high'
                        ? 'text-red-600'
                        : alert.severity === 'medium'
                        ? 'text-yellow-500'
                        : 'text-green-600'
                    }`}
                  >
                    {alert.title}
                  </h3>
                </div>
                <p className="text-sm text-secondary mt-2">
                  {alert.description}
                </p>
              </div>
            ))}
          </div>

          {/* You can add additional dashboard components here */}
        </div>
      </main>

      <Footer />
    </div>
  );
}