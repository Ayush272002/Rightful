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
} from 'lucide-react';
import { Header } from '@/components/custom';
import { UserUploads } from '@/components/custom/UserUploads';
import { DocumentProcessor } from '@/components/custom';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

// Core configuration
const SUPPORTED_FILE_TYPES = ['PDF', 'TXT'] as const;
const MAX_FILE_SIZE_MB = 10;

export default function Dashboard() {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [showProcessor, setShowProcessor] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true); // for CSR
  }, []);

  /**
   * Validates a file for upload
   * @param file - The file to validate
   * @returns boolean indicating if the file is valid
   */
  const validateFile = (file: File): boolean => {
    // Reset any previous errors
    setError(null);

    // Check file type
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

    // Check file size (convert MB to bytes)
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
    console.log('Processing complete:', result);
    // You can add additional logic here if needed
  };

  const closeError = (): void => {
    setError(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {isMounted && <Header />}

      <main className="flex-1 container py-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Upload section */}
          <div className="lg:col-span-3 h-full">
            <div className="card p-6 h-full">
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors h-full flex flex-col items-center justify-center ${
                  isDragging ? 'border-accent bg-accent/5' : 'border-border'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                  <Upload className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-medium mb-3">
                  Upload Document for Analysis
                </h3>
                <p className="text-secondary mb-8 max-w-md">
                  Drag and drop your file ({SUPPORTED_FILE_TYPES.join(', ')}) or
                  click to browse. We&apos;ll analyse it for similarity with
                  existing documents on the blockchain.
                </p>
                <Button size="lg" className="gap-2" onClick={handleFileSelect}>
                  Choose File
                </Button>
              </div>
            </div>
          </div>

          {/* Recent activity sidebar */}
          <div className="h-full">
            <div className="card p-4 h-full flex flex-col">
              <Link href="/uploads">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-medium">Your Uploads</h3>
                  {/* <Link href="/uploads"> */}
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Link>

              {/* UserUploads component with simplified dashboard style */}
              <UserUploads
                isSidebar={true}
                maxItems={3}
                showBlockchainButton={false}
                useDashboardStyle={true}
              />

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
            </div>
          </div>
        </div>

        {/* Document Processor Modal */}
        {showProcessor && uploadedFile && (
          <DocumentProcessor
            onClose={handleProcessorClose}
            onComplete={handleProcessorComplete}
            file={uploadedFile}
          />
        )}

        {/* Error Message */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-md z-50 border-l-4 border-red-500">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700">
                  Upload Failed
                </p>
                <p className="text-xs text-secondary mt-1">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={closeError}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
