import { NextRequest, NextResponse } from 'next/server';
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
    const body = await req.json();
    const validated = VoiceCompanionSchema.parse(body);

    const result = await GeminiService.queryVoiceCompanion(
      validated.queryText,
      validated.locationCity,
      validated.vulnerableMemberTypes
    );

    return NextResponse.json(result);
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Voice assistant failed' }, { status: 500 });
  }
}
