import { beforeEach } from 'vitest';
import { dbService } from '../db/database';

beforeEach(() => {
  // Reset test store before each run to ensure complete test isolation
  const fixture = dbService.createSeedData();
  const db = dbService.getDb();
  db.cities = fixture.cities;
  db.familyMembers = fixture.familyMembers;
  db.routinePlans = fixture.routinePlans;
  db.communityAlerts = fixture.communityAlerts;
  db.auditLogs = fixture.auditLogs;
  dbService.save();
});
