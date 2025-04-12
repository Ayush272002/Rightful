'use client';

import { useState, useEffect } from 'react';
import ChatWindow from './ChatWindow';

/**
 * Agent component that displays the AI assistant icon on pages
 * This allows the AI to be present across the site (except landing page)
 */
export default function Agent(props: {pageName: string, details: string}) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Use useEffect to handle client-side rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      {/* AI Bot icon in bottom right */}
      <img
        src="/AIHead.png"
        alt="AI Chat Bot"
        className="fixed bottom-8 right-8 w-16 cursor-pointer animate-bob z-50"
        onClick={() => setIsChatOpen(!isChatOpen)}
      />

      {/* Chat window - only render when open and on client-side */}
      {isMounted && isChatOpen && (
        <div className="fixed bottom-8 right-8 z-50 pointer-events-auto">
          <ChatWindow onClose={() => setIsChatOpen(false)} />
        </div>
      )}
    </>
  );
}