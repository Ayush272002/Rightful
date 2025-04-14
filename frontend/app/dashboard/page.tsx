'use client';

/**
 * @fileoverview Dashboard page for document analysis and blockchain verification.
 * Provides drag-and-drop functionality for file uploads and displays recent user activity.
 */

import { Button } from '@/components/ui/button';
import {
  Upload,
  FileText,
  Bell,
  ArrowRight,
  ExternalLink,
  X,
  AlertCircle,
  Link2,
  ChevronRight,
  ChevronLeft,
  BarChart3,
} from 'lucide-react';
import { Header } from '@/components/custom';
import { DocumentProcessor } from '@/components/custom';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import Agent from '@/components/custom/Agent';
import { useRouter } from 'next/navigation';
import { getDocumentHashes } from '@/utils/getDocumentHashes';
import { getDocument, getDocumentsByHash } from '@/utils/getDocument';

// Core configuration
const SUPPORTED_FILE_TYPES = ['PDF', 'TXT'] as const;
const MAX_FILE_SIZE_MB = 10;

export default function Dashboard() {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [showProcessor, setShowProcessor] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [documentDetails, setDocumentDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);

  const documentsScrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch dashboard global stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      setIsLoading(true);

      // Get all localStorage keys that start with 'upload_'
      const uploadKeys = Object.keys(localStorage).filter((key) =>
        key.startsWith('upload_')
      );
      const realDocumentsData = [];

      // Process each upload from localStorage
      for (const key of uploadKeys) {
        const uploadData = JSON.parse(localStorage.getItem(key) || '{}');
        if (uploadData.documentHash) {
          const doc = await getDocument(
            uploadData.documentHash,
            uploadData.documentHashIndex
          );
          let i = 0;
          realDocumentsData.push({
            id: doc.documentHash + '-' + (i - 1),
            title: doc.title,
            description: doc.description,
            dateAdded: doc.submissionTimestamp.toLocaleString(),
            url: doc.resourceLocation,
          });
          i += 1;
        }
      }

      // Mock API response with global stats and document list
      const mockApiResponse = {
        globalStats: {
          totalRegistered: realDocumentsData.length,
          newWorks: realDocumentsData.length,
          lastCheckTimestamp: Date.now() - 172800000, // 2 days ago
        },
        activityData: {
          timeframe: 'weekly',
          data: [
            {
              value: 35,
              verifications: 8,
              registrations: 27,
              date: '2025-04-07',
            },
            {
              value: 62,
              verifications: 14,
              registrations: 48,
              date: '2025-04-08',
            },
            {
              value: 47,
              verifications: 11,
              registrations: 36,
              date: '2025-04-09',
            },
            {
              value: 73,
              verifications: 21,
              registrations: 52,
              date: '2025-04-10',
            },
            {
              value: 58,
              verifications: 17,
              registrations: 41,
              date: '2025-04-11',
            },
            {
              value: 39,
              verifications: 12,
              registrations: 27,
              date: '2025-04-12',
            },
            {
              value: 85,
              verifications: 29,
              registrations: 56,
              date: '2025-04-13',
            },
          ],
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        },
        documents: realDocumentsData,
      };

      // Update state with "fetched" data
      setDashboardStats(mockApiResponse);
      setIsLoading(false);

      toast.success('Dashboard updated with latest data');
    };

    if (isMounted) {
      fetchDashboardStats();
    }
  }, [isMounted]);

  // Fetch document-specific details when a document is selected
  useEffect(() => {
    const fetchDocumentDetails = async (docId: string) => {
      setIsLoadingDetails(true);

      // Simulate API delay
      // await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock API response with document-specific stats
      const mockDocumentResponse = {
        id: docId,
        title: dashboardStats?.documents.find((doc: any) => doc.id === docId)
          ?.title,
        description: dashboardStats?.documents.find(
          (doc: any) => doc.id === docId
        )?.description,
        url: dashboardStats?.documents.find((doc: any) => doc.id === docId)
          ?.url,
        dateAdded: dashboardStats?.documents.find(
          (doc: any) => doc.id === docId
        )?.dateAdded,
        stats: {
          averageSimilarity: Math.floor(Math.random() * 30) + 70, // Random 70-99%
          infringements: Math.floor(Math.random() * 3), // Random 0-2
        },
      };

      setDocumentDetails(mockDocumentResponse);
      setIsLoadingDetails(false);
    };

    if (selectedDocument && dashboardStats) {
      fetchDocumentDetails(selectedDocument);
    } else {
      setDocumentDetails(null);
    }
  }, [selectedDocument, dashboardStats]);

  const handleDocumentClick = (docId: string) => {
    setSelectedDocument((prevId) => (prevId === docId ? null : docId));
  };

  const scrollDocuments = (direction: 'left' | 'right') => {
    if (documentsScrollRef.current) {
      const scrollAmount = 300;
      if (direction === 'left') {
        documentsScrollRef.current.scrollBy({
          left: -scrollAmount,
          behavior: 'smooth',
        });
      } else {
        documentsScrollRef.current.scrollBy({
          left: scrollAmount,
          behavior: 'smooth',
        });
      }
    }
  };

  // File handling functions
  const validateFile = (file: File): boolean => {
    setError(null);
    const fileExtension = file.name.split('.').pop()?.toUpperCase();
    if (
      !fileExtension ||
      !SUPPORTED_FILE_TYPES.includes(fileExtension as any)
    ) {
      setError(
        `Unsupported file type. Please use: ${SUPPORTED_FILE_TYPES.join(', ')}`
      );
      return false;
    }
    const maxSizeBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File too large. Maximum size: ${MAX_FILE_SIZE_MB}MB`);
      return false;
    }
    return true;
  };

  const handleFileUpload = (file: File): void => {
    if (validateFile(file)) {
      setUploadedFile(file);
      setShowProcessor(true);
    }
  };

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (): void => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = SUPPORTED_FILE_TYPES.map(
      (type) => `.${type.toLowerCase()}`
    ).join(',');
    fileInput.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files?.length) {
        handleFileUpload(target.files[0]);
      }
    };
    fileInput.click();
  };

  const handleProcessorClose = (): void => {
    setShowProcessor(false);
    setUploadedFile(null);
  };

  const handleProcessorComplete = (result: any): void => {
    toast.success('Document processed successfully');
    setShowProcessor(false);
    setUploadedFile(null);
  };

  const closeError = (): void => {
    setError(null);
  };

  const scrollToUpload = () => {
    const uploadSection = document.querySelector('#upload-section');
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToDocuments = () => {
    const documentsSection = document.querySelector('#documents-section');
    if (documentsSection) {
      documentsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Add function to trigger the Agent chat
  const openAgentChat = () => {
    // Add a small delay to ensure DOM is ready
    setTimeout(() => {
      // More specific selector to find the Agent button
      const agentButton = document.querySelector('img[alt="AI Chat Bot"]');

      if (agentButton) {
        console.log('Found Agent button, clicking it...');
        (agentButton as HTMLElement).click();
      } else {
        console.log('Agent button not found');

        // Fallback: try finding by position
        const fixedButtons = document.querySelectorAll('.fixed');
        for (const btn of fixedButtons) {
          if (btn.querySelector('img')) {
            console.log('Found potential agent button by position');
            (btn as HTMLElement).click();
            return;
          }
        }
      }
    }, 100);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {isMounted && <Header />}

      {/* Welcome and Top Stats Section */}
      <section className="bg-gradient-to-r from-background to-accent/5 py-6 border-b">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left half: Welcome and global stats */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-4">
                Welcome back
              </h1>

              {isLoading ? (
                // Loading state for global stats
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="card p-4 bg-white/80 backdrop-blur h-32 animate-pulse"
                    >
                      <div className="h-4 bg-muted rounded w-24 mb-4"></div>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-muted"></div>
                        <div className="space-y-2">
                          <div className="h-6 bg-muted rounded w-20"></div>
                          <div className="h-4 bg-muted rounded w-12"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Total Registered Works */}
                  <div className="card p-4 bg-white/80 backdrop-blur">
                    <p className="text-sm text-muted-foreground">
                      Total Registered
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-3xl font-bold">
                        {dashboardStats?.globalStats.totalRegistered}
                      </p>
                      <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                        <FileText className="w-6 h-6 text-accent" />
                      </div>
                    </div>
                    <div className="mt-2 h-2 bg-accent/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: '70%' }}
                      ></div>
                    </div>
                  </div>

                  {/* New Works Added */}
                  <div className="card p-4 bg-white/80 backdrop-blur">
                    <p className="text-sm text-muted-foreground">New Works</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold">
                          +{dashboardStats?.globalStats.newWorks}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          since{' '}
                          {new Date(
                            dashboardStats?.globalStats.lastCheckTimestamp
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <ArrowRight className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right half: AI Assistant/Chat */}
            <div className="bg-white/80 backdrop-blur rounded-lg border shadow-sm p-4 h-full min-h-[220px]">
              <div className="flex items-center gap-3 mb-4 border-b pb-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <img
                    src="/AIHead.png"
                    alt="AI Assistant"
                    className="w-8 h-8"
                  />
                </div>
                <div>
                  <h3 className="font-medium">Rightful AI</h3>
                  <p className="text-xs text-muted-foreground">
                    What would you like to do today?
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 py-3">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={scrollToUpload}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Log my work on the blockchain
                </Button>

                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => router.push('/uploads')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Find similar content to my work
                </Button>

                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={scrollToDocuments}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View my current documents
                </Button>

                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={openAgentChat}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Ask me something else
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Document List Section */}
      <section id="documents-section" className="py-6 border-b">
        <div className="container">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Your Documents</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => scrollDocuments('left')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => scrollDocuments('right')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="min-w-[280px] h-48 bg-white/80 backdrop-blur rounded-lg border animate-pulse"
                >
                  <div className="p-4 h-full">
                    <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-5/6 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-4/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : dashboardStats?.documents?.length > 0 ? (
            <div
              ref={documentsScrollRef}
              className="flex gap-4 overflow-x-auto pb-4 scroll-smooth"
              style={{ scrollbarWidth: 'thin' }}
            >
              {dashboardStats.documents.map((doc: any) => (
                <div
                  key={doc.id}
                  className={`min-w-[280px] max-w-[280px] bg-white/80 backdrop-blur rounded-lg border shadow-sm cursor-pointer transition-all
                    ${selectedDocument === doc.id ? 'border-accent ring-1 ring-accent' : 'hover:border-accent/50'}`}
                  onClick={() => handleDocumentClick(doc.id)}
                >
                  <div className="p-4">
                    <h3 className="font-medium line-clamp-1">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                      {doc.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-3">
                      Added: {doc.dateAdded}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center py-12 bg-white/80 backdrop-blur rounded-lg border">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted/30 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Please register documents to view them here
                </p>
                <Link href="/uploads">
                  <Button className="mt-4 gap-2">
                    <Upload className="w-4 h-4" />
                    Upload a document
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Document Detail View */}
      {selectedDocument && (
        <section className="py-6">
          <div className="container">
            {isLoadingDetails ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/80 backdrop-blur rounded-lg border p-4 animate-pulse">
                  <div className="h-6 bg-muted rounded w-1/2 mb-6"></div>
                  <div className="space-y-4">
                    <div className="h-20 bg-muted rounded"></div>
                    <div className="h-20 bg-muted rounded"></div>
                    <div className="h-12 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-lg border p-4 animate-pulse">
                  <div className="h-6 bg-muted rounded w-1/2 mb-6"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-32 bg-muted rounded"></div>
                    <div className="h-32 bg-muted rounded"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left half: Document details */}
                <div className="bg-white/80 backdrop-blur rounded-lg border p-6">
                  <h2 className="text-xl font-bold mb-4">Document Details</h2>

                  <div className="space-y-4">
                    {/* Title box */}
                    <div className="border rounded-md p-4">
                      <p className="text-sm text-muted-foreground mb-1">
                        Title
                      </p>
                      <p className="font-medium">{documentDetails?.title}</p>
                    </div>

                    {/* Description box */}
                    <div className="border rounded-md p-4">
                      <p className="text-sm text-muted-foreground mb-1">
                        Description
                      </p>
                      <p>{documentDetails?.description}</p>
                    </div>

                    {/* URL box */}
                    <div className="border rounded-md p-4">
                      <p className="text-sm text-muted-foreground mb-1">
                        Blockchain URL
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-ellipsis overflow-hidden">
                          {documentDetails?.url}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Link2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right half: Document-specific stats */}
                <div className="bg-white/80 backdrop-blur rounded-lg border p-6">
                  <h2 className="text-xl font-bold mb-4">Analysis Results</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Average Similarity Score */}
                    <div className="card p-4 flex items-center gap-4 bg-gray-50">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            className="stroke-muted-foreground/20"
                            strokeWidth="2"
                          ></circle>
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            className="stroke-accent"
                            strokeWidth="2"
                            strokeDasharray={`${documentDetails?.stats.averageSimilarity} 100`}
                            strokeLinecap="round"
                            transform="rotate(-90 18 18)"
                          ></circle>
                          <text
                            x="18"
                            y="20"
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="bold"
                            className="fill-foreground"
                          >
                            {documentDetails?.stats.averageSimilarity}%
                          </text>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Similarity Score
                        </p>
                        <p className="text-xl font-semibold">
                          {documentDetails?.stats.averageSimilarity}% Original
                        </p>
                      </div>
                    </div>

                    {/* Infringements Detected */}
                    <div className="card p-4 bg-gray-50">
                      <p className="text-sm text-muted-foreground">
                        Possible Infringements
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-3xl font-bold">
                          {documentDetails?.stats.infringements}
                        </p>
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                      </div>
                      {documentDetails?.stats.infringements > 0 ? (
                        <Button
                          variant="link"
                          className="text-xs p-0 h-auto mt-2 text-red-600"
                        >
                          Review suspicious activities →
                        </Button>
                      ) : (
                        <p className="text-xs text-green-600 mt-2">
                          No issues detected
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button className="w-full">View Full Analysis</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Main section at bottom - now has the activity chart */}
      <main className="flex-1 container py-8 relative">
        {/* MOVED: Activity Timeline to bottom where upload used to be */}
        {/* Activity Timeline with Enhanced Data */}
        <div className="card p-4 bg-white/80 backdrop-blur">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Recent Blockchain Activity</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 bg-accent/10 text-accent"
              >
                Weekly
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="h-40 w-full animate-pulse bg-muted rounded"></div>
          ) : (
            <div className="relative">
              {/* Chart Legend - Updated Colors */}
              <div className="flex items-center gap-4 mb-2 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-slate-400 rounded-sm mr-1"></div>
                  <span>Total Transactions</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-accent rounded-sm mr-1"></div>
                  <span>Verifications</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-slate-300 rounded-sm mr-1"></div>
                  <span>Registrations</span>
                </div>
              </div>

              <div className="h-40 w-full relative mt-1">
                {/* Chart container with bottom padding for x-axis */}
                <div
                  className="absolute inset-0 flex items-end px-4"
                  style={{ bottom: '20px', height: 'calc(100% - 20px)' }}
                >
                  {dashboardStats?.activityData.data.map(
                    (item: any, i: number) => {
                      // Scale the height properly with adjusted container size
                      const containerHeight = 140; // 160px - 20px for bottom padding
                      const heightScale = 0.9; // Use 90% of the container height to leave room for labels
                      const scaledHeight =
                        (item.value / 100) * containerHeight * heightScale;
                      const verificationHeight =
                        (item.verifications / item.value) * scaledHeight;
                      const registrationHeight =
                        (item.registrations / item.value) * scaledHeight;

                      return (
                        <div key={i} className="flex-1 mx-1 relative group">
                          {/* Main bar with total value - updated color */}
                          <div
                            className="w-full bg-slate-400/70 rounded-t relative"
                            style={{ height: `${scaledHeight}px` }}
                          >
                            {/* Registration bar - updated color */}
                            <div
                              className="absolute bottom-0 left-0 w-full bg-slate-300 rounded-b"
                              style={{ height: `${registrationHeight}px` }}
                            ></div>

                            {/* Verification bar - using accent color */}
                            <div
                              className="absolute bottom-0 left-0 w-full bg-accent"
                              style={{
                                height: `${verificationHeight}px`,
                                bottom: `${registrationHeight}px`,
                              }}
                            ></div>
                          </div>

                          {/* Tooltip on hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-foreground text-background text-xs rounded p-1 whitespace-nowrap z-10">
                            <div>
                              Date: {new Date(item.date).toLocaleDateString()}
                            </div>
                            <div>Total: {item.value}</div>
                            <div>Verifications: {item.verifications}</div>
                            <div>Registrations: {item.registrations}</div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                {/* Date labels - positioned at the bottom of the chart */}
                <div className="absolute bottom-0 w-full border-t border-muted pt-1 flex justify-between px-4">
                  {dashboardStats?.activityData.labels.map(
                    (day: string, i: number) => (
                      <span key={i} className="text-xs text-muted-foreground">
                        {day}
                      </span>
                    )
                  )}
                </div>

                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between items-start text-xs text-muted-foreground pr-1">
                  <span>100</span>
                  <span>75</span>
                  <span>50</span>
                  <span>25</span>
                  <span>0</span>
                </div>
              </div>
            </div>
          )}

          {/* Insight summary */}
          <div className="text-sm mt-4 pt-3 border-t">
            <p className="text-muted-foreground">
              <span className="text-foreground font-medium">
                Activity summary:
              </span>{' '}
              Most active day was Sunday with 85 transactions. You&apos;ve seen
              a<span className="text-accent"> 34% increase</span> in
              verification requests this week.
            </p>
          </div>
        </div>
      </main>

      {/* AI Assistant*/}
      <div>
        <Agent pageName={'dashboard'} details={'top level'} />
      </div>
    </div>
  );
}
