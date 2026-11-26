import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { FamilyMemberSchema } from '@/lib/validations/schemas';
import { dbService } from '@/lib/db/database';
import { RateLimitService } from '@/lib/services/rate-limit.service';
import { FamilyMember } from '@/lib/types';

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const limitCheck = RateLimitService.checkLimit(ip);
  if (!limitCheck.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const members = dbService.getDb().familyMembers;
  return NextResponse.json({ members });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const limitCheck = RateLimitService.checkLimit(ip);
  if (!limitCheck.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body: unknown = await req.json();
    const validated = FamilyMemberSchema.parse(body);

    const newMember: FamilyMember = {
      id: `fam-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: validated.name,
      relation: validated.relation,
      age: validated.age,
      vulnerabilities: validated.vulnerabilities,
      dailyRoutineType: validated.dailyRoutineType,
      n95Recommended: validated.n95Recommended,
      maxSafeOutdoorAqi: validated.maxSafeOutdoorAqi,
    };

    const db = dbService.getDb();
    db.familyMembers.push(newMember);
    dbService.save();
    dbService.logAudit('FAMILY_ADMIN', 'FAMILY_MEMBER_ADDED', `Added member ${validated.name} (${validated.relation})`);

    return NextResponse.json(newMember, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: err.issues }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : 'Unknown internal error';
    return NextResponse.json({ error: 'Failed to save family member', message }, { status: 500 });
  }
}
