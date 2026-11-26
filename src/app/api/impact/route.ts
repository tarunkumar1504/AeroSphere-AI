import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ImpactCalculateSchema } from '@/lib/validations/schemas';
import { ImpactService } from '@/lib/services/impact.service';
import { RateLimitService } from '@/lib/services/rate-limit.service';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const limitCheck = RateLimitService.checkLimit(ip);
  if (!limitCheck.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body: unknown = await req.json();
    const validated = ImpactCalculateSchema.parse(body);

    const impact = ImpactService.calculate({
      outdoorPm25: validated.outdoorAqi * 0.65,
      hoursIndoorsWithPurifier: validated.hoursSpentIndoorsWithFilter,
      commuteShift: validated.commuteModeShifted,
      usedRangeHood: validated.cookingFumeExhaustUsed,
      avoidedBiomassBurning: validated.woodBurningAvoided,
    });

    return NextResponse.json(impact);
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid impact parameters', details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to calculate impact' }, { status: 500 });
  }
}
