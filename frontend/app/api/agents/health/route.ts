/**
 * @fileoverview Endpoint to check if the backend service is alive and responding.
 * Performs a basic health check by attempting to connect to the chat endpoint.
 */

import { NextResponse } from 'next/server';

// TODO: Add timeout configuration for health checks
// TOOD: Maybe make more comprehensive health check

export async function GET() {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';

  try {
    console.log(
      `checking backend availability at: ${backendUrl}/api/agents/chat`
    ); // Logs attempt to connect

    const response = await fetch(`${backendUrl}/api/agents/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'health check',
        context: '',
      }),
    });

    return NextResponse.json({
      status: 'ok',
      backendStatus: response.status,
      backendUrl,
    });
  } catch (error) {
    console.error('Backend health check failed:', error);

    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        backendUrl,
      },
      { status: 500 }
    );
  }
}
