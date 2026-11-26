import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CommunityAlertSchema } from '@/lib/validations/schemas';
import { CommunityService } from '@/lib/services/community.service';
import { RateLimitService } from '@/lib/services/rate-limit.service';

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const limitCheck = RateLimitService.checkLimit(ip);
  if (!limitCheck.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const alerts = CommunityService.getAllAlerts();
  const metrics = CommunityService.getCommunityMetrics();
  return NextResponse.json({ alerts, metrics });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const limitCheck = RateLimitService.checkLimit(ip, 15);
  if (!limitCheck.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const body: unknown = await req.json();
    const validated = CommunityAlertSchema.parse(body);

    const alert = CommunityService.addAlert(
      validated.authorName,
      validated.neighborhood,
      validated.type,
      validated.title,
      validated.description,
      validated.severity
    );

    return NextResponse.json(alert, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid alert submission', details: err.issues }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : 'Unknown internal error';
    return NextResponse.json({ error: 'Failed to post community alert', message }, { status: 500 });
  }
}
