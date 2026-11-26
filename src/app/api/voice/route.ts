import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { VoiceCompanionSchema } from '@/lib/validations/schemas';
import { GeminiService } from '@/lib/services/gemini.service';
import { RateLimitService } from '@/lib/services/rate-limit.service';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const limitCheck = RateLimitService.checkLimit(ip, 20); // 20 voice queries per min
  if (!limitCheck.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const body: unknown = await req.json();
    const validated = VoiceCompanionSchema.parse(body);

    const result = await GeminiService.queryVoiceCompanion(
      validated.queryText,
      validated.locationCity,
      validated.vulnerableMemberTypes
    );

    return NextResponse.json(result);
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : 'Unknown internal error';
    return NextResponse.json({ error: 'Voice assistant failed', message }, { status: 500 });
  }
}
