'use client';

/**
 * @fileoverview Uploads page for displaying all user documents.
 * Provides search, filtering, and pagination capabilities.
 */

import { useState, useEffect } from 'react';
import { Header } from '@/components/custom';
import { UserUploads } from '@/components/custom/UserUploads';
import { DocumentProcessor } from '@/components/custom';
import { Button } from '@/components/ui/button';
import { Upload, ArrowLeft, X, FileText, Search } from 'lucide-react';
import Link from 'next/link';
import { Toaster, toast } from 'sonner';

// Core configuration
const SUPPORTED_FILE_TYPES = ['PDF', 'TXT'] as const;
const MAX_FILE_SIZE_MB = 10;

export default function UploadsPage() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showProcessor, setShowProcessor] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    setIsMounted(true); // for CSR
  }, []);

  /**
   * Validates a file for upload
   * @param file - The file to validate
   * @returns boolean indicating if the file is valid
   */
  const validateFile = (file: File): boolean => {
    console.log('Validating file:', file.name);

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toUpperCase();
    if (
      !fileExtension ||
      !SUPPORTED_FILE_TYPES.includes(fileExtension as any)
    ) {
      const errorMsg = `Unsupported file type. Please use: ${SUPPORTED_FILE_TYPES.join(', ')}`;
      toast.error('Invalid File Type', {
        description: errorMsg,
        className: 'bg-background text-foreground border-border',
      });
      return false;
    }

    // Check file size (convert MB to bytes)
    const maxSizeBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const errorMsg = `File too large. Maximum size: ${MAX_FILE_SIZE_MB}MB`;
      toast.error('File Too Large', {
        description: errorMsg,
        className: 'bg-background text-foreground border-border',
      });
      return false;
    }

    return true;
  };

  const handleFileUpload = (file: File) => {
    console.log('Starting file upload:', file.name);
    if (!validateFile(file)) {
      return;
    }

    setUploadedFile(file);
    setShowProcessor(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    };
    input.click();
  };

  const handleProcessorClose = () => {
    setShowProcessor(false);
    setUploadedFile(null);
  };

  const handleProcessorComplete = (result: any) => {
    console.log('Processing complete:', result);
    // You can add additional logic here if needed
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster position="bottom-right" richColors theme="system" />
      {isMounted && <Header />}

      <main className="flex-1 container py-8">
        <div className="flex flex-col gap-6">
          {/* Page header */}
          <div className="flex items-center gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-semibold">Your Documents</h1>
              <p className="text-secondary text-sm">
                View and manage all your uploaded documents
              </p>
            </div>
          </div>

          {/* Upload section */}
          <div className="card p-6">
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
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
              <p className="text-secondary mb-8 max-w-md mx-auto">
                Drag and drop your file ({SUPPORTED_FILE_TYPES.join(', ')}) or
                click to browse. We&apos;ll analyse it for similarity with
                existing documents on the blockchain.
              </p>
              <Button size="lg" className="gap-2" onClick={handleFileSelect}>
                Choose File
              </Button>
            </div>
          </div>

          {/* Document list */}
          <div className="card p-6">
            <UserUploads isSidebar={false} />
          </div>
        </div>
      </main>

      {/* Document Processor Modal */}
      {showProcessor && uploadedFile && (
        <DocumentProcessor
          onClose={handleProcessorClose}
          onComplete={handleProcessorComplete}
          file={uploadedFile}
        />
      )}
    </div>
  );
}
