import { getConfig, updateConfig } from '@app/lib/storage';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/config - Get queue configuration
export async function GET() {
  try {
    const config = getConfig();
    return NextResponse.json({ config });
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

// PATCH /api/config - Update queue configuration
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const config = updateConfig(body);
    return NextResponse.json({ config });
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }
}
