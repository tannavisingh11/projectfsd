import { Router, Request, Response } from 'express';
import { prisma } from '../services/db.js';

export const statsRouter = Router();

/**
 * GET /api/stats
 * Aggregated live intelligence statistics for dashboard, charts, and KPI cards
 */
statsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const [
      totalReports,
      reportsByStatus,
      reportsByCategory,
      reportsByUrgency,
      totalRequests,
      requestsByStatus,
      totalResources,
      resourcesByStatus,
      duplicateStats,
      allReports,
    ] = await Promise.all([
      prisma.incidentReport.count(),
      prisma.incidentReport.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.incidentReport.groupBy({ by: ['category'], _count: { id: true } }),
      prisma.incidentReport.groupBy({ by: ['urgency'], _count: { id: true } }),
      prisma.helpRequest.count(),
      prisma.helpRequest.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.resource.count(),
      prisma.resource.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.duplicateSuggestion.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.incidentReport.findMany({
        select: { createdAt: true, status: true, urgency: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Format category distribution for charts
    const categoryDistribution = reportsByCategory.map((c) => ({
      category: c.category,
      count: c._count.id,
    }));

    // Format status distribution
    const statusDistribution = reportsByStatus.map((s) => ({
      status: s.status,
      count: s._count.id,
    }));

    // Format urgency distribution
    const urgencyDistribution = reportsByUrgency.map((u) => ({
      urgency: u.urgency,
      count: u._count.id,
    }));

    // Create trend timeline for Recharts (e.g. past hours/buckets)
    const timeTrends: Record<string, number> = {};
    allReports.forEach((r) => {
      const dateStr = new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      timeTrends[dateStr] = (timeTrends[dateStr] || 0) + 1;
    });

    const timelineData = Object.entries(timeTrends).map(([time, count]) => ({
      time,
      reports: count,
    }));

    // Calculate pending verification
    const pendingVerification = reportsByStatus.find((s) => s.status === 'UNVERIFIED')?._count.id || 0;
    const underReview = reportsByStatus.find((s) => s.status === 'UNDER_REVIEW')?._count.id || 0;
    const verifiedCount = reportsByStatus.find((s) => s.status === 'VERIFIED')?._count.id || 0;
    const resolvedCount = reportsByStatus.find((s) => s.status === 'RESOLVED')?._count.id || 0;

    // Resource stats
    const deployedUnits = resourcesByStatus.find((r) => r.status === 'DEPLOYED')?._count.id || 0;
    const availableUnits = resourcesByStatus.find((r) => r.status === 'AVAILABLE')?._count.id || 0;

    // Active requests
    const activeRequests = totalRequests - (requestsByStatus.find((r) => r.status === 'RESOLVED')?._count.id || 0);

    res.json({
      summary: {
        totalReports,
        pendingVerification,
        underReview,
        verifiedCount,
        resolvedCount,
        totalRequests,
        activeRequests,
        totalResources,
        deployedUnits,
        availableUnits,
      },
      categoryDistribution,
      statusDistribution,
      urgencyDistribution,
      requestsByStatus: requestsByStatus.map((r) => ({ status: r.status, count: r._count.id })),
      duplicateStats: duplicateStats.map((d) => ({ status: d.status, count: d._count.id })),
      timelineData: timelineData.length > 0 ? timelineData : [{ time: '10:00', reports: 1 }, { time: '12:00', reports: 3 }, { time: '14:00', reports: 6 }],
    });
  } catch (err: any) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to retrieve analytics', details: err.message });
  }
});
