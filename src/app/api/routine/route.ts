import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GenerateRoutineSchema } from '@/lib/validations/schemas';
import { GeminiService } from '@/lib/services/gemini.service';
import { RateLimitService } from '@/lib/services/rate-limit.service';
import { dbService } from '@/lib/db/database';
import { FamilyMember } from '@/lib/types';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const limitCheck = RateLimitService.checkLimit(ip, 30); // 30 routine generations per min
  if (!limitCheck.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 });
  }

  try {
    const body: unknown = await req.json();
    const validated = GenerateRoutineSchema.parse(body);

    const plan = await GeminiService.generateTailoredRoutine(
      validated.cityId,
      validated.lifestyle,
      validated.familyMembers as FamilyMember[],
      validated.userPreferences
    );

    dbService.logAudit(
      'ANONYMOUS_USER',
      'ROUTINE_PLAN_GENERATED',
      `Generated low-emission routine for ${validated.cityId} with lifestyle ${validated.lifestyle}`,
      ip
    );

    return NextResponse.json(plan);
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: err.issues }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : 'Unknown internal error';
    return NextResponse.json({ error: 'Failed to generate routine plan', message }, { status: 500 });
  }
}
