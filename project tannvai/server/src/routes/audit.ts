import { Router, Request, Response } from 'express';
import { prisma } from '../services/db.js';

export const auditRouter = Router();

/**
 * GET /api/audit
 * Inspect full transparency audit trail
 */
auditRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { entityType, action, limit } = req.query;
    const where: any = {};
    if (entityType && entityType !== 'ALL') where.entityType = String(entityType);
    if (action && action !== 'ALL') where.action = String(action);

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit ? Math.min(100, Number(limit)) : 50,
      include: {
        performedBy: { select: { id: true, name: true, role: true } },
      },
    });

    res.json({ logs });
  } catch (err: any) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ error: 'Failed to retrieve audit logs', details: err.message });
  }
});
