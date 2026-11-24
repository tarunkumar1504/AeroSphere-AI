import { CommunityAlert } from '../types';
import { dbService } from '../db/database';

export class CommunityService {
  public static getAllAlerts(): CommunityAlert[] {
    return dbService.getDb().communityAlerts;
  }

  public static addAlert(
    authorName: string,
    neighborhood: string,
    type: CommunityAlert['type'],
    title: string,
    description: string,
    severity: CommunityAlert['severity']
  ): CommunityAlert {
    const alert: CommunityAlert = {
      id: `comm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      authorName,
      neighborhood,
      type,
      title,
      description,
      severity,
      status: 'ACTIVE',
      upvotes: 1,
      createdAt: new Date().toISOString(),
    };

    const db = dbService.getDb();
    db.communityAlerts.unshift(alert);
    dbService.save();
    dbService.logAudit(authorName, 'COMMUNITY_ALERT_CREATED', `Created community alert: "${title}" in ${neighborhood}`);

    return alert;
  }

  public static upvoteAlert(alertId: string): CommunityAlert | null {
    const db = dbService.getDb();
    const alert = db.communityAlerts.find((a) => a.id === alertId);
    if (!alert) return null;

    alert.upvotes += 1;
    if (alert.upvotes >= 10 && alert.status === 'ACTIVE') {
      alert.status = 'VERIFIED';
    }
    dbService.save();
    return alert;
  }

  public static getCommunityMetrics(): {
    activeAlertsCount: number;
    cleanAirSheltersCount: number;
    carpoolPledgesCount: number;
    totalNeighborhoodsCovered: number;
  } {
    const alerts = this.getAllAlerts();
    const neighborhoods = new Set(alerts.map((a) => a.neighborhood));

    return {
      activeAlertsCount: alerts.filter((a) => a.status === 'ACTIVE' || a.status === 'VERIFIED').length,
      cleanAirSheltersCount: alerts.filter((a) => a.type === 'CLEAN_AIR_SHELTER').length,
      carpoolPledgesCount: alerts.filter((a) => a.type === 'CARPOOL_OFFER' || a.type === 'ECO_HEATING_PLEDGE').length,
      totalNeighborhoodsCovered: neighborhoods.size,
    };
  }
}
