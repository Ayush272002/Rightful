/**
 * @fileoverview API route handler for chat functionality. Forwards requests to backend
 * and handles responses/errors appropriately.
 */

import { NextRequest, NextResponse } from 'next/server';

// TODO: Add rate limiting to prevent abuse
// TODO: Add request validation middleware
// TODO: Consider adding response caching for common queries

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();

    const BACKEND_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const CHAT_ENDPOINT = `${BACKEND_URL}/api/agents/chat`;

    try {
      const backendResponse = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await backendResponse.json();

      return NextResponse.json(responseData);
    } catch (backendError) {
      console.error('Cannot reach backend:', backendError);

      // Graceful degradation when backend is unavailable
      return NextResponse.json({
        status: 'SAFE',
        message:
          'Sorry, I seem to be having connectivity issues right now. Please try again later.',
        isMock: true,
      });
    }
  } catch (error) {
    console.error('Chat request failed:', error);

    return NextResponse.json(
      {
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
