import { NextRequest, NextResponse } from 'next/server';
import { AirQualityService } from '@/lib/services/air-quality.service';
import { RateLimitService } from '@/lib/services/rate-limit.service';

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const limitCheck = RateLimitService.checkLimit(ip);
  if (!limitCheck.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const cityId = searchParams.get('cityId');

  if (cityId) {
    const assessment = AirQualityService.getRealtimeAssessment(cityId);
    return NextResponse.json(assessment);
  }

  const cities = AirQualityService.getAllCities();
  return NextResponse.json({ cities });
}
