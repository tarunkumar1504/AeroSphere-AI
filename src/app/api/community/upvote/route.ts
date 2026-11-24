import { NextRequest, NextResponse } from 'next/server';
import { CommunityService } from '@/lib/services/community.service';
import { RateLimitService } from '@/lib/services/rate-limit.service';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const limitCheck = RateLimitService.checkLimit(ip);
  if (!limitCheck.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const { alertId } = await req.json();
    if (!alertId || typeof alertId !== 'string') {
      return NextResponse.json({ error: 'alertId is required' }, { status: 400 });
    }

    const updated = CommunityService.upvoteAlert(alertId);
    if (!updated) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to upvote' }, { status: 500 });
  }
}
