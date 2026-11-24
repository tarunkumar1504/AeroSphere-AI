import { NextRequest, NextResponse } from 'next/server';
import { FamilyMemberSchema } from '@/lib/validations/schemas';
import { dbService } from '@/lib/db/database';
import { RateLimitService } from '@/lib/services/rate-limit.service';

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
    const body = await req.json();
    const validated = FamilyMemberSchema.parse(body);

    const newMember = {
      id: `fam-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...validated,
    };

    const db = dbService.getDb();
    db.familyMembers.push(newMember as any);
    dbService.save();
    dbService.logAudit('FAMILY_ADMIN', 'FAMILY_MEMBER_ADDED', `Added member ${validated.name} (${validated.relation})`);

    return NextResponse.json(newMember, { status: 201 });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to save family member' }, { status: 500 });
  }
}
