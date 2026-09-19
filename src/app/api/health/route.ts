import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check DB connectivity
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'healthy', database: 'connected' }, { status: 200 });
  } catch (error) {
    logger.error({ err: error }, 'Health check failed');
    return NextResponse.json({ status: 'unhealthy', database: 'disconnected' }, { status: 503 });
  }
}
