'use client';
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
  const [alerts, setAlerts] = useState<
    {
      upload: string;
      title: string;
      description: string;
      similarity: number;
      hash: string;
      index: number;
    }[]
  >([]);

  useEffect(() => {
    // Hardcoded JSON response simulating backend data.
    const mockAlerts = [
      {
        upload: 'Market Manipulation.pdf',
        title: 'Guide to Money Laundering',
        description:
          'A comprehensive guide detailing methods and risks associated with money laundering.',
        similarity: 85,
        hash: 'abc123',
        index: 1,
      },
      {
        upload: 'Gender Gap is Fake.txt',
        title: 'Why single mothers steal from landlords',
        description:
          'An investigative report examining the claims and circumstances related to this controversial issue.',
        similarity: 60,
        hash: 'def456',
        index: 2,
      },
    ];

    // If there is no response or the response is empty, show a green "all clear" alert.
    if (!mockAlerts || mockAlerts.length === 0) {
      setAlerts([
        {
          upload: '',
          title: 'All Clear!',
          description: 'Good News, no similarities or infringements found',
          similarity: 0,
          hash: '',
          index: 0,
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
          <h2
            className="heading-medium mb-4 
            {`${
              alerts.some(alert => alert.similarity >= 50)
                ? 'text-black-600'
                : 'text-green-600'
            }`}"
          >
            Intellectual Property Infringement Alerts
          </h2>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.index}
                className={`relative p-4 rounded-lg border ${
                  alert.similarity >= 90
                    ? 'border-red-600 bg-red-50'
                    : alert.similarity >= 70
                      ? 'border-yellow-500 bg-yellow-50'
                      : alert.similarity >= 50
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-green-600 bg-green-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlertCircle
                    className={`w-6 h-6 ${
                      alert.similarity >= 90
                        ? 'text-red-600'
                        : alert.similarity >= 70
                          ? 'text-yellow-500'
                          : alert.similarity >= 50
                            ? 'text-blue-500'
                            : 'text-green-600'
                    }`}
                  />
                  <h3
                    className={`text-lg font-medium ${
                      alert.similarity >= 90
                        ? 'text-red-600'
                        : alert.similarity >= 70
                          ? 'text-yellow-500'
                          : alert.similarity >= 50
                            ? 'text-blue-500'
                            : 'text-green-600'
                    }`}
                  >
                    {alert.upload} may be being infringed by {alert.title}
                  </h3>
                </div>
                <p className="text-sm text-secondary mt-2">
                  This document is described as: {alert.description}
                </p>
                <span
                  className={`absolute bottom-2 right-2 text-xs font-bold ${
                    alert.similarity >= 90
                      ? 'text-red-600'
                      : alert.similarity >= 70
                        ? 'text-yellow-500'
                        : alert.similarity >= 50
                          ? 'text-blue-500'
                          : 'text-green-600'
                  }`}
                >
                  {alert.similarity}%
                </span>
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
