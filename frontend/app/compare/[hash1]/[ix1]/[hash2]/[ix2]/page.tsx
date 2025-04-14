'use client';

/**
 * @fileoverview Uploads page for displaying all user documents.
 * Provides search, filtering, and pagination capabilities.
 */

import { useState, useEffect } from 'react';
import { Header } from '@/components/custom';
import { Toaster, toast } from 'sonner';
import { useParams } from 'next/navigation';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface MatchBlock {
  blockA: string;
  blockB: string;
  startIndexA: number;
  startIndexB: number;
  charOffsetA: number;
  charOffsetB: number;
  length: number;
  averageSimilarity: number;
}

export default function ComparePage() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [similarityResponse, setSimilarityResponse] = useState<MatchBlock[]>(
    []
  );

  const params = useParams();
  const documentHash1 = params.hash1 as string;
  const documentIx1 = params.ix1 as string;
  const documentHash2 = params.hash2 as string;
  const documentIx2 = params.ix2 as string;

  useEffect(() => {
    setIsMounted(true); // for CSR
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/agents/compare/${documentHash1}/${documentIx1}/${documentHash2}/${documentIx2}`
        );
        console.log('Success:', response.data);
        setSimilarityResponse(response.data);
      } catch (error: any) {
        console.error('Error:', error);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster position="bottom-right" richColors theme="system" />
      {isMounted && <Header />}

      <main className="flex-1 container py-8">
        <div className="flex flex-col gap-6">
          {/* Page header */}
          <div className="flex items-center gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-semibold">Document Comparison</h1>
              <p className="text-secondary text-sm">
                Compare two documents on a more granular level.
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            {similarityResponse.map((mb, index) => (
              <div
                key={index}
                className="rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm bg-white dark:bg-zinc-900"
              >
                <h2 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-200">
                  Match #{index + 1} — Similarity:{' '}
                  {(mb.averageSimilarity * 100).toFixed(2)}%
                </h2>

                <div className="grid gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Document A
                    </p>
                    <p className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-md text-sm text-gray-800 dark:text-gray-100">
                      {mb.blockA}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Document B
                    </p>
                    <p className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-md text-sm text-gray-800 dark:text-gray-100">
                      {mb.blockB}
                    </p>
                  </div>

                  <div className="text-xs text-muted-foreground mt-2">
                    <p>Start Index A: {mb.startIndexA}</p>
                    <p>Start Index B: {mb.startIndexB}</p>
                    <p>Length: {mb.length}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
