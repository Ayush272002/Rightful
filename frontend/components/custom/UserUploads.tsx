// TODO: Replace with actual data from the blockchain (HARDCODED)
'use client';

/**
 * @fileoverview UserUploads component for displaying a user's uploaded documents.
 * Can be used in both the dashboard sidebar and the dedicated uploads page.
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  FileText,
  ArrowRight,
  ExternalLink,
  Bell,
  Search,
  Filter,
} from 'lucide-react';
import Link from 'next/link';

// Mock data for user uploads
const MOCK_UPLOADS = [
  {
    id: '1',
    name: 'Document 1.pdf',
    uploadedAt: '2023-06-15T10:30:00Z',
    size: '2.4 MB',
    status: 'verified',
  },
  {
    id: '2',
    name: 'Document 2.txt',
    uploadedAt: '2023-06-12T14:45:00Z',
    size: '1.8 MB',
    status: 'pending',
  },
  {
    id: '3',
    name: 'Document 3.pdf',
    uploadedAt: '2023-06-10T09:15:00Z',
    size: '3.2 MB',
    status: 'verified',
  },
  {
    id: '4',
    name: 'Document 4.txt',
    uploadedAt: '2023-06-05T16:20:00Z',
    size: '1.5 MB',
    status: 'verified',
  },
  {
    id: '5',
    name: 'Document 5.pdf',
    uploadedAt: '2023-06-01T11:10:00Z',
    size: '4.1 MB',
    status: 'pending',
  },
];

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
/**
 * @fileoverview Component for displaying user document uploads with filtering and sorting capabilities.
 * Supports both sidebar and full-page views with customisable styling options.
 *
 * @todo Add pagination support for large document lists
 * @todo Implement proper error handling for failed document loads
 * @todo Add loading states and skeleton UI
 */

interface UserUploadsProps {
  isSidebar?: boolean;
  maxItems?: number;
  showBlockchainButton?: boolean;
  useDashboardStyle?: boolean;
}

export function UserUploads({
  isSidebar = false,
  maxItems = 2,
  showBlockchainButton = true,
  useDashboardStyle = false,
}: UserUploadsProps) {
  // state management for uploads and filters
  const [uploads, setUploads] = useState(MOCK_UPLOADS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Filter uploads based on search and status
  const filteredUploads = uploads.filter((upload) => {
    const matchesSearch = upload.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = !filterStatus || upload.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Sort by upload date (newest first)
  const sortedUploads = [...filteredUploads].sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  // limit items for sidebar view
  const displayedUploads = isSidebar
    ? sortedUploads.slice(0, maxItems)
    : sortedUploads;

  // Render simplified dashboard view if specified
  if (useDashboardStyle) {
    return (
      <div className="space-y-2 mb-4 flex-grow">
        {displayedUploads.map((upload) => (
          <Link href={`/uploads/${upload.id}`} key={upload.id}>
            <div className="flex items-center justify-between p-2 rounded-lg border border-border hover:border-accent/50 transition-colors">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" />
                <div>
                  <p className="text-xs font-medium">{upload.name}</p>
                  <p className="text-xs text-secondary">
                    {formatRelativeTime(upload.uploadedAt)}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-6 px-2">
                View
              </Button>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className={`${isSidebar ? 'h-full flex flex-col' : ''}`}>
      {!isSidebar && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-2xl font-semibold">Your Documents</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary" />
              <input
                type="text"
                placeholder="Search documents..."
                className="pl-10 pr-4 py-2 w-full rounded-md border border-border bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(null)}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'verified' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('verified')}
              >
                Verified
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('pending')}
              >
                Pending
              </Button>
            </div>
          </div>
        </div>
      )}

      {isSidebar && !useDashboardStyle && (
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-medium">Your Uploads</h3>
          <Link href="/uploads">
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}

      {displayedUploads.length > 0 ? (
        <div className={`space-y-2 ${isSidebar ? 'mb-4 flex-grow' : 'mb-6'}`}>
          {displayedUploads.map((upload) => (
            <Link href={`/uploads/${upload.id}`} key={upload.id}>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{upload.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-secondary">
                        {formatRelativeTime(upload.uploadedAt)}
                      </p>
                      <span className="text-xs text-secondary">•</span>
                      <p className="text-xs text-secondary">{upload.size}</p>
                      <span className="text-xs text-secondary">•</span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full ${
                          upload.status === 'verified'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {upload.status === 'verified' ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 px-3">
                  View
                </Button>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-accent" />
          </div>
          <h3 className="text-lg font-medium mb-2">No documents found</h3>
          <p className="text-secondary text-sm max-w-md">
            {searchTerm || filterStatus
              ? 'No documents match your search criteria. Try adjusting your filters.'
              : "You haven't uploaded any documents yet. Upload a document to get started."}
          </p>
          {!isSidebar && (
            <Button className="mt-4 gap-2" asChild>
              <Link href="/dashboard">Upload Document</Link>
            </Button>
          )}
        </div>
      )}

      {isSidebar && showBlockchainButton && !useDashboardStyle && (
        <div className="pt-3 border-t border-border mt-auto">
          <Link href="/blockchain-activity">
            <Button className="w-full gap-2">
              <Bell className="w-4 h-4" />
              View Blockchain Activity
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </Link>
          <p className="text-xs text-secondary mt-2 text-center">
            See similar documents and blockchain verifications
          </p>
        </div>
      )}

      {!isSidebar && filteredUploads.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline" className="gap-2">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
