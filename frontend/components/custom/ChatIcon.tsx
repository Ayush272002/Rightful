'use client';

/**
 * @fileoverview Component that renders a bouncing chat icon button which opens the chat interface.
 */

import { useState, useEffect } from 'react';

interface ChatIconProps {
  onClick: () => void;
}

export default function ChatIcon({ onClick }: ChatIconProps) {
  // Track if component has mounted to handle SSR
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * Handles click events on the chat icon
   * @param e Mouse event object
   */
  const handleClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  // prevent SSR issues by not rendering until mounted
  if (!isMounted) {
    return null;
  }

  // TODO: Add loading state while image is being fetched
  // TODO: Consider adding hover effects for better UX
  return (
    <button
      onClick={handleClick}
      className="w-16 h-16 cursor-pointer animate-bounce flex items-center justify-center"
      aria-label="Open chat"
    >
      <img
        src="/AIHead.png"
        alt="AI Chat"
        className="w-full h-full object-contain"
      />
    </button>
  );
}
