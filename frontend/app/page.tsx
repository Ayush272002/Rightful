'use client';
/**
 * @fileoverview Home page component for Rightful - an intellectual property protection platform.
 * Implements a hero section with a half-and-half layout: left has the title/description and right shows a bobbing AI bot.
 * The bot smoothly transitions from a large floating image to a small fixed chat icon as you scroll.
 *
 * @todo Add proper error handling for file uploads
 * @todo Implement drag-and-drop functionality
 * @todo Add loading states to buttons
 */

import { Button } from '@/components/ui/button';
import { ArrowRight, Upload, FileText, BarChart3, Link2 } from 'lucide-react';
import { Header, Footer } from '@/components/custom';
import { useEffect, useState, useRef } from 'react';
import ChatWindow from '../components/custom/ChatWindow';

// Constants for reusable values
const SUPPORTED_FILE_TYPES = ['PDF', 'TXT'];
const SCROLL_THRESHOLD = 50; // Start transition
const SCROLL_END = 70; // End transition

export default function Home() {
  const [showChat, setShowChat] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0); // 0 to 1 transition value
  const botRef = useRef<HTMLImageElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;

      // Calculate transition progress (0 at top, 1 when fully scrolled past threshold)
      if (scrollPosition <= SCROLL_THRESHOLD) {
        setScrollProgress(0);
      } else if (scrollPosition >= SCROLL_END) {
        setScrollProgress(1);
      } else {
        // Smooth transition between thresholds
        setScrollProgress(
          (scrollPosition - SCROLL_THRESHOLD) / (SCROLL_END - SCROLL_THRESHOLD)
        );
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update the botStyle to transition correctly from top-right to bottom-right
  const botStyle: React.CSSProperties = {
    position: 'fixed',
    top: scrollProgress === 0 ? '25%' : '85%', // Start near the top of hero section
    right: scrollProgress === 0 ? '2%' : `${scrollProgress}rem`, // Start at right side of hero section
    bottom: scrollProgress === 0 ? 'auto' : `${4 * scrollProgress}rem`,
    width: `${16 - scrollProgress * 10}rem`, // Shrink from large to small
    transform: `translateY(${scrollProgress * 1}vh)`, // Move down as we scroll
    transition: 'all 0.3s ease-out',
    zIndex: 50,
    animationPlayState: scrollProgress > 0.5 ? 'paused' : 'running',
  };
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Use useEffect to handle client-side rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero section with main CTA */}
      <section
        ref={heroSectionRef}
        className="relative py-16 md:py-14 px-5 bg-gradient-to-b from-background to-white"
      >
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap- items-center">
            {/* Left half - Value proposition (2/3 width) */}
            <div className="md:col-span-2">
              <h1 className="heading-large mb-4">
                The AI Protecting your Intellectual Property On-Chain
              </h1>
              <p className="text-secondary text-lg mb-8 max-w-lg">
                Rightful uses AI agents to detect document similarity and help
                you protect your intellectual property through blockchain
                technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="gap-2">
                  <a href="upload">Upload Document</a>
                </Button>
              </div>
            </div>

            {/* Right column - empty space where bot will visually appear */}
            <div className="md:col-span-1 relative">
              {/* Background for the AI Bot */}
              <img
                src="AIBackground.png"
                alt="AI Background"
                className="absolute inset-0 w-full h-full object-contain pl-0"
              />
              {/* This is just a placeholder to maintain the grid layout */}
              <div style={{ height: '300px' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Single AI Bot that transitions as you scroll */}
      <img
        src="AIHead.png"
        alt="AI Chat Bot"
        className="cursor-pointer animate-bob"
        style={botStyle}
        onClick={() => setIsChatOpen(!isChatOpen)}
      />

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
                Be Notified of Potential Infringements
              </Button>
              <p className="text-sm text-secondary mt-2 text-center">
                Get notified when your content is used without permission.
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

      {/* Process explanation section */}
      <section id="how-it-works" className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="heading-medium mb-4">How Rightful Works</h2>
            <p className="text-secondary max-w-2xl mx-auto">
              Our platform uses advanced AI and blockchain technology to detect
              similarities between documents and protect intellectual property.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="card">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <Upload className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-xl font-medium mb-2">1. Upload Document</h3>
              <p className="text-secondary text-sm">
                Upload your document to the blockchain and provide basic
                information.
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

      {/* Chat window - only render when open and on client-side */}
      {isMounted && isChatOpen && (
        <div className="fixed bottom-8 right-8 z-50 pointer-events-auto">
          <ChatWindow onClose={() => setIsChatOpen(false)} />
        </div>
      )}
    </div>
  );
}
