import { getConfig } from '@app/lib/storage';
import { NextResponse } from 'next/server';

/**
 * Queue Status - Get current queue status
 * GET /api/queue/status
 */
export async function GET() {
  try {
    const config = getConfig();

    return NextResponse.json({
      config,
      status: 'operational',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching queue status:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch queue status',
      },
      { status: 500 }
    );
  }
}
