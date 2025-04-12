// MOCK DATA: NEEDS TO BE REPLACED WITH ACTUAL DATA FROM THE BLOCKCHAIN

'use client';

/**
 * @fileoverview Dynamic page for displaying detailed information about a specific document.
 * Uses the document ID from the URL to fetch and display document details.
 */

import { useState, useEffect } from 'react';
import { Header } from '@/components/custom/Header';
import { Button } from '@/components/ui/button';
import {
  FileText,
  ArrowLeft,
  ExternalLink,
  Clock,
  Hash,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Mock data for document details
const MOCK_DOCUMENTS: Record<
  string,
  {
    id: string;
    name: string;
    uploadedAt: string;
    size: string;
    status: 'verified' | 'pending';
    hash: string;
    blockchainTx?: string;
    similarDocuments?: Array<{
      id: string;
      name: string;
      similarity: number;
    }>;
  }
> = {
  '1': {
    id: '1',
    name: 'Document 1.pdf',
    uploadedAt: '2023-06-15T10:30:00Z',
    size: '2.4 MB',
    status: 'verified',
    hash: '0x1234...5678',
    blockchainTx: '0xabcd...efgh',
    similarDocuments: [
      { id: '3', name: 'Document 3.pdf', similarity: 0.95 },
      { id: '5', name: 'Document 5.pdf', similarity: 0.85 },
    ],
  },
  '2': {
    id: '2',
    name: 'Document 2.txt',
    uploadedAt: '2023-06-12T14:45:00Z',
    size: '1.8 MB',
    status: 'pending',
    hash: '0x2345...6789',
    similarDocuments: [{ id: '4', name: 'Document 4.txt', similarity: 0.92 }],
  },
  '3': {
    id: '3',
    name: 'Document 3.pdf',
    uploadedAt: '2023-06-10T09:15:00Z',
    size: '3.2 MB',
    status: 'verified',
    hash: '0x3456...7890',
    blockchainTx: '0xbcde...fghi',
    similarDocuments: [
      { id: '1', name: 'Document 1.pdf', similarity: 0.95 },
      { id: '5', name: 'Document 5.pdf', similarity: 0.78 },
    ],
  },
  '4': {
    id: '4',
    name: 'Document 4.txt',
    uploadedAt: '2023-06-05T16:20:00Z',
    size: '1.5 MB',
    status: 'verified',
    hash: '0x4567...8901',
    blockchainTx: '0xcdef...ghij',
    similarDocuments: [{ id: '2', name: 'Document 2.txt', similarity: 0.92 }],
  },
  '5': {
    id: '5',
    name: 'Document 5.pdf',
    uploadedAt: '2023-06-01T11:10:00Z',
    size: '4.1 MB',
    status: 'pending',
    hash: '0x5678...9012',
    similarDocuments: [
      { id: '1', name: 'Document 1.pdf', similarity: 0.85 },
      { id: '3', name: 'Document 3.pdf', similarity: 0.78 },
    ],
  },
};

// Format date to relative time (e.g., "2 days ago")
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
};

// Format date to readable format (e.g., "June 15, 2023 at 10:30 AM")
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
};

export default function DocumentPage() {
  const [mounted, setMounted] = useState(false);
  const params = useParams();
  const documentId = params.id as string;
  const document = MOCK_DOCUMENTS[documentId];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">Document Not Found</h1>
            <p className="text-secondary mb-6">
              The document you&apos;re looking for doesn&apos;t exist or has
              been removed.
            </p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/uploads">Back to Uploads</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/uploads">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Uploads
              </Link>
            </Button>
          </div>

          <div className="bg-card rounded-lg border border-border p-6 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold mb-1">
                    {document.name}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm px-2 py-0.5 rounded-full ${
                        document.status === 'verified'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {document.status === 'verified' ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Pending Verification
                        </span>
                      )}
                    </span>
                    <span className="text-sm text-secondary">•</span>
                    <span className="text-sm text-secondary">
                      {document.size}
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                Download
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Upload Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-secondary">Uploaded</span>
                      <span>{formatDate(document.uploadedAt)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-secondary">Time Ago</span>
                      <span>{formatRelativeTime(document.uploadedAt)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Document Hash</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Hash className="w-4 h-4 text-accent" />
                    <code className="bg-muted px-2 py-1 rounded">
                      {document.hash}
                    </code>
                  </div>
                </div>

                {document.blockchainTx && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      Blockchain Transaction
                    </h3>
                    <div className="flex items-center gap-2 text-sm">
                      <ExternalLink className="w-4 h-4 text-accent" />
                      <code className="bg-muted px-2 py-1 rounded">
                        {document.blockchainTx}
                      </code>
                    </div>
                  </div>
                )}
              </div>

              {document.similarDocuments &&
                document.similarDocuments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      Similar Documents
                    </h3>
                    <div className="space-y-2">
                      {document.similarDocuments.map((similar) => (
                        <Link
                          key={similar.id}
                          href={`/uploads/${similar.id}`}
                          className="block p-3 rounded-lg border border-border hover:border-accent/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-accent" />
                              <span className="text-sm">{similar.name}</span>
                            </div>
                            <span className="text-sm text-secondary">
                              {Math.round(similar.similarity * 100)}% match
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
