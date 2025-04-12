'use client';
import { useState, useRef, useEffect } from 'react';

/**
 * @fileoverview Chat window component for the Rightful platform assistant.
 * Handles user interactions, message history, and API communication.
 */

interface Message {
  type: 'user' | 'assistant';
  content: string;
  status?: string;
}

interface ChatWindowProps {
  onClose: () => void;
}

export default function ChatWindow({ onClose }: ChatWindowProps) {
  // Core state management
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle client-side rendering to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Ensure chat always scrolls to latest message
  useEffect(() => {
    if (isMounted) {
      scrollToBottom();
    }
  }, [messages, isMounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { type: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Format conversation history for context
      const formattedContext = messages
        .filter((m) => m.content && m.content !== 'undefined')
        .map((m) => `${m.type}: ${m.content}`)
        .join('\n');

      console.log('Sending request with context:', formattedContext);

      const response = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: formattedContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'DANGEROUS') {
        setMessages((prev) => [
          ...prev,
          {
            type: 'assistant',
            content:
              "I'm concerned about your message. If you're having thoughts of self-harm, please contact a mental health professional or call a crisis hotline. I'm here to help with questions about the Rightful platform.",
            status: data.status,
          },
        ]);
      } else if (data.status === 'INAPPROPRIATE') {
        // Check if there's a valid platform question despite inappropriate language
        const isPlatformQuestion = userMessage
          .toLowerCase()
          .match(/(platform|work|how|what|feature)/);

        if (isPlatformQuestion) {
          setMessages((prev) => [
            ...prev,
            {
              type: 'assistant',
              content:
                "I'd be happy to help you with the Rightful platform. What specific feature would you like to know about?",
              status: 'SAFE',
            },
            {
              type: 'assistant',
              content:
                'Note: I aim to keep our conversation respectful and professional.',
              status: 'INFO',
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              type: 'assistant',
              content:
                "I can't help with that kind of content. Let's keep our conversation focused on the Rightful platform.",
              status: data.status,
            },
          ]);
        }
      } else if (data.status === 'OFF_TOPIC') {
        setMessages((prev) => [
          ...prev,
          {
            type: 'assistant',
            content:
              "I'm here to help with questions about the Rightful platform. What would you like to know about our features?",
            status: data.status,
          },
        ]);
      } else if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            type: 'assistant',
            content:
              "I'm having trouble processing your request. Could you try asking about the Rightful platform in a different way?",
            status: data.status || 'ERROR',
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: 'assistant',
            content:
              data.response ||
              data.message ||
              "I'm having trouble understanding. Could you rephrase that?",
            status: data.status || 'SAFE',
          },
        ]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          type: 'assistant',
          content:
            'I apologise, but I seem to be having trouble connecting. Please try again later.',
          status: 'ERROR',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // prevent SSR issues
  if (!isMounted) return null;

  return (
    <div className="w-96 h-[32rem] bg-white border border-gray-300 shadow-lg rounded-lg flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Rightful Assistant</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              } ${message.status === 'ERROR' ? 'bg-red-100' : ''}`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 animate-pulse">
              Typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the platform..."
            className="flex-1 rounded-lg border border-gray-300 p-2 focus:outline-none focus:border-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
