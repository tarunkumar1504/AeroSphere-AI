import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db/database';
import { RateLimitService } from '@/lib/services/rate-limit.service';

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const limitCheck = RateLimitService.checkLimit(ip);
  if (!limitCheck.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const logs = dbService.getDb().auditLogs;
  return NextResponse.json({ logs });
}
