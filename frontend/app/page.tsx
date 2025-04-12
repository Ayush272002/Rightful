'use client';
/**
 * @fileoverview Home page component for Rightful - an intellectual property protection platform
 * Implements the landing page with hero section and feature overview for new users.
 *
 * @todo Add proper error handling for file uploads
 * @todo Implement drag-and-drop functionality
 * @todo Add loading states to buttons
 */

import { Button } from '@/components/ui/button';
import { ArrowRight, Upload, FileText, BarChart3, Link2 } from 'lucide-react';
import { Header, Footer } from '@/components/custom';
import { useEffect, useState } from 'react';
import ChatWindow from './components/custom/ChatWindow';
import ChatIcon from './components/custom/ChatIcon';

// Constants for reusable values
const SUPPORTED_FILE_TYPES = ['PDF', 'TXT'];

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Use useEffect to handle client-side rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* header component handles navigation and branding */}
      <Header />

      {/* Hero section with main CTA and upload widget */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left column - Value proposition */}
            <div>
              <h1 className="heading-large mb-4">
                Secure Intellectual Property on the Blockchain
              </h1>
              <p className="text-secondary text-lg mb-8 max-w-lg">
                Rightful uses AI agents to detect document similarity and help
                you protect your intellectual property through blockchain
                technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="gap-2">
                  Upload Document <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  How It Works <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Right column - Upload widget */}
            <div className="relative rounded-xl overflow-hidden border border-border bg-white shadow-sm p-8">
              <div className="upload-area">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                    <Upload className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    Upload Your Document
                  </h3>
                  <p className="text-sm text-secondary mb-6 max-w-xs mx-auto">
                    Drag and drop your file ({SUPPORTED_FILE_TYPES.join(', ')})
                    or click to browse
                  </p>
                  <Button size="sm">Select File</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Our Services Section */}
          <section className="py-12">
            <div className="container mx-auto">
              <h2 className="heading-medium text-center mb-6">Our Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="card flex flex-col items-center justify-center p-6">
                  <FileText className="w-8 h-8 text-accent mb-4" />
                  <Button size="lg" variant="outline">
                    Register my Intellectual Content
                  </Button>
                  <p className="text-sm text-secondary mt-2 text-center">
                    Securely register and safeguard your original documents.
                  </p>
                </div>
                <div className="card flex flex-col items-center justify-center p-6">
                  <Link2 className="w-8 h-8 text-accent mb-4" />
                  <Button size="lg" variant="outline">
                    Link to Google Docs
                  </Button>
                  <p className="text-sm text-secondary mt-2 text-center">
                    Connect to Google Docs for seamless integration.
                  </p>
                </div>
                <div className="card flex flex-col items-center justify-center p-6">
                  <BarChart3 className="w-8 h-8 text-accent mb-4" />
                  <Button size="lg" variant="outline">
                    Check my work for plagiarism
                  </Button>
                  <p className="text-sm text-secondary mt-2 text-center">
                    Analyze your document for originality and overlap.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* Process explanation section */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="heading-medium mb-4">How Rightful Works</h2>
            <p className="text-secondary max-w-2xl mx-auto">
              Our platform uses advanced AI and blockchain technology to detect
              similarities between documents and protect intellectual property.
            </p>
          </div>

          {/* Process steps grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="card">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <Upload className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-xl font-medium mb-2">1. Upload Document</h3>
              <p className="text-secondary text-sm">
                Upload your document to the blockchain and provide basic
                information
              </p>
            </div>

            {/* Step 2 */}
            <div className="card">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-xl font-medium mb-2">2. AI Analysis</h3>
              <p className="text-secondary text-sm">
                Our AI extracts text and calculates vector representation for
                similarity comparison.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-xl font-medium mb-2">3. View Results</h3>
              <p className="text-secondary text-sm">
                See similar documents with percentage match and links to the
                original sources.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Chat components - only render on client-side */}
      {isMounted && (
        <div className="fixed bottom-8 right-8 z-50 pointer-events-auto">
          {isChatOpen ? (
            <ChatWindow onClose={() => setIsChatOpen(false)} />
          ) : (
            <ChatIcon
              onClick={() => {
                console.log('Chat icon clicked, setting isChatOpen to true');
                setIsChatOpen(true);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
