import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { IaqAssessmentSchema } from '@/lib/validations/schemas';
import { IaqService } from '@/lib/services/iaq.service';
import { RateLimitService } from '@/lib/services/rate-limit.service';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const limitCheck = RateLimitService.checkLimit(ip);
  if (!limitCheck.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body: unknown = await req.json();
    const validated = IaqAssessmentSchema.parse(body);

    const assessment = IaqService.assessRoom(
      validated.roomType,
      validated.outdoorAqi,
      validated.roomAreaSqFt,
      validated.hasPurifier,
      validated.purifierCadr,
      validated.windowStatus
    );

    const diyGuides = IaqService.getDiySolutions();

    return NextResponse.json({
      assessment,
      diyGuides,
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to assess indoor air quality' }, { status: 500 });
  }
}
