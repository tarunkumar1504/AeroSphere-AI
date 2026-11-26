import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getAirQuality } from '@/app/api/air-quality/route';
import { POST as postRoutine } from '@/app/api/routine/route';
import { POST as postIaq } from '@/app/api/iaq/route';
import { POST as postImpact } from '@/app/api/impact/route';
import { GET as getCommunity, POST as postCommunity } from '@/app/api/community/route';
import { POST as postVoice } from '@/app/api/voice/route';
import { GET as getAudit } from '@/app/api/audit/route';
import { GET as getFamily, POST as postFamily } from '@/app/api/family/route';

describe('Next.js RESTful API Route Handlers Integration Suite', () => {
  it('GET /api/air-quality returns all cities or filtered city assessment', async () => {
    // 1. All cities query
    const reqAll = new NextRequest('http://localhost:3000/api/air-quality');
    const resAll = await getAirQuality(reqAll);
    expect(resAll.status).toBe(200);
    const dataAll = await resAll.json();
    expect(dataAll.cities.length).toBeGreaterThan(0);

    // 2. Specific city query
    const reqCity = new NextRequest('http://localhost:3000/api/air-quality?cityId=delhi-anand-vihar');
    const resCity = await getAirQuality(reqCity);
    expect(resCity.status).toBe(200);
    const dataCity = await resCity.json();
    expect(dataCity.city.name).toContain('Delhi');
    expect(dataCity.currentMetrics.aqi).toBeGreaterThan(300);
  });

  it('POST /api/routine generates inversion-tailored routine and validates payloads', async () => {
    const validReq = new NextRequest('http://localhost:3000/api/routine', {
      method: 'POST',
      body: JSON.stringify({
        cityId: 'delhi-anand-vihar',
        lifestyle: 'COMMUTER',
        userPreferences: {
          hasAirPurifier: true,
          canWorkFromHome: false,
          commuteMode: 'METRO',
        },
      }),
    });
    const res = await postRoutine(validReq);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.slots.length).toBe(4);
    expect(data.impact.pm25InhaledAvoidedMicrograms).toBeGreaterThan(0);

    // Invalid schema payload must return 400
    const invalidReq = new NextRequest('http://localhost:3000/api/routine', {
      method: 'POST',
      body: JSON.stringify({ cityId: '', lifestyle: 'UNKNOWN' }),
    });
    const invalidRes = await postRoutine(invalidReq);
    expect(invalidRes.status).toBe(400);
  });

  it('POST /api/iaq delivers CADR calculations and Corsi-Rosenthal blueprints', async () => {
    const req = new NextRequest('http://localhost:3000/api/iaq', {
      method: 'POST',
      body: JSON.stringify({
        roomType: 'BEDROOM',
        roomAreaSqFt: 240,
        outdoorAqi: 280,
        hasPurifier: true,
        purifierCadr: 320,
        windowStatus: 'WEATHERSTRIPPED',
        cookingType: 'ELECTRIC_INDUCTION',
      }),
    });
    const res = await postIaq(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.assessment.roomName).toBe('Master Bedroom');
    expect(data.diyGuides.length).toBeGreaterThanOrEqual(3);
  });

  it('POST /api/impact quantifies emissions and PM2.5 avoidance accurately', async () => {
    const req = new NextRequest('http://localhost:3000/api/impact', {
      method: 'POST',
      body: JSON.stringify({
        outdoorAqi: 300,
        hoursSpentIndoorsWithFilter: 14,
        commuteModeShifted: 'CAR_TO_METRO',
        cookingFumeExhaustUsed: true,
        woodBurningAvoided: true,
      }),
    });
    const res = await postImpact(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.pm25InhaledAvoidedMicrograms).toBeGreaterThan(0);
    expect(data.co2EmissionsSavedKg).toBeGreaterThan(0);
  });

  it('GET and POST /api/community handles crowdsourced alerts cleanly', async () => {
    const newAlertReq = new NextRequest('http://localhost:3000/api/community', {
      method: 'POST',
      body: JSON.stringify({
        authorName: 'Sarah Jenkins',
        neighborhood: 'Sector 5',
        type: 'CARPOOL_OFFER',
        title: 'EV Carpool to downtown',
        description: 'Leaving at 08:30 AM with clean filtered cabin.',
        severity: 'INFO',
      }),
    });
    const postRes = await postCommunity(newAlertReq);
    expect(postRes.status).toBe(201);

    const getReq = new NextRequest('http://localhost:3000/api/community');
    const getRes = await getCommunity(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.alerts.some((a: { title: string }) => a.title === 'EV Carpool to downtown')).toBe(true);
  });

  it('POST /api/voice queries conversational companion with fallback safety', async () => {
    const req = new NextRequest('http://localhost:3000/api/voice', {
      method: 'POST',
      body: JSON.stringify({
        queryText: 'Can I exercise outdoors today?',
        locationCity: 'Delhi - Anand Vihar',
        currentAqi: 380,
      }),
    });
    const res = await postVoice(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.replyText).toBeTruthy();
    expect(data.recommendedActions.length).toBeGreaterThan(0);
  });

  it('GET /api/audit returns immutable security logs', async () => {
    const req = new NextRequest('http://localhost:3000/api/audit');
    const res = await getAudit(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.logs.length).toBeGreaterThan(0);
  });

  it('GET and POST /api/family manages vulnerable member profiles', async () => {
    const addReq = new NextRequest('http://localhost:3000/api/family', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Liam',
        relation: 'CHILD',
        age: 5,
        vulnerabilities: ['ASTHMA'],
        dailyRoutineType: 'STUDENT',
        n95Recommended: true,
        maxSafeOutdoorAqi: 80,
      }),
    });
    const addRes = await postFamily(addReq);
    expect(addRes.status).toBe(201);

    const getReq = new NextRequest('http://localhost:3000/api/family');
    const getRes = await getFamily(getReq);
    expect(getRes.status).toBe(200);
    const data = await getRes.json();
    expect(data.members.some((m: { name: string }) => m.name === 'Liam')).toBe(true);
  });
});
