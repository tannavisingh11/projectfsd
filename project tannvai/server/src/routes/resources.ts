import { Router, Request, Response } from 'express';
import { prisma } from '../services/db.js';
import { requireRole } from '../middleware/auth.js';
import { logAuditEvent } from '../services/auditLogger.js';

export const resourcesRouter = Router();

/**
 * GET /api/resources
 * List all relief and emergency coordination resources
 */
resourcesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { type, status } = req.query;
    const where: any = {};
    if (type && type !== 'ALL') where.type = String(type);
    if (status && status !== 'ALL') where.status = String(status);

    const resources = await prisma.resource.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        assignments: {
          where: { status: { in: ['ASSIGNED', 'EN_ROUTE', 'ON_SCENE'] } },
          include: { helpRequest: true },
        },
      },
    });

    res.json({ resources });
  } catch (err: any) {
    console.error('Error fetching resources:', err);
    res.status(500).json({ error: 'Failed to retrieve resources', details: err.message });
  }
});

/**
 * POST /api/resources
 * Register a new emergency resource
 */
resourcesRouter.post('/', requireRole(['COORDINATOR', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const { name, type, capacity, availableCount, location, contactPerson } = req.body;

    const resource = await prisma.resource.create({
      data: {
        name,
        type: type || 'EQUIPMENT',
        capacity: Number(capacity) || 1,
        availableCount: Number(availableCount) || Number(capacity) || 1,
        status: 'AVAILABLE',
        location: location || 'Central Depot',
        contactPerson,
      },
    });

    await logAuditEvent({
      entityType: 'SYSTEM',
      entityId: resource.id,
      action: 'CREATED',
      performedById: req.user?.id,
      performedByName: req.user?.name,
      performedByRole: req.user?.role,
      newState: resource,
      notes: `Added resource "${resource.name}" to emergency fleet.`,
    });

    res.status(201).json({ success: true, resource });
  } catch (err: any) {
    console.error('Error creating resource:', err);
    res.status(500).json({ error: 'Failed to register resource', details: err.message });
  }
});

/**
 * PATCH /api/resources/:id
 * Update resource status or count
 */
resourcesRouter.patch('/:id', requireRole(['COORDINATOR', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status, availableCount, location } = req.body;

    const existing = await prisma.resource.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Resource not found' });

    const updated = await prisma.resource.update({
      where: { id },
      data: {
        status: status || existing.status,
        availableCount: availableCount !== undefined ? Number(availableCount) : existing.availableCount,
        location: location || existing.location,
      },
    });

    res.json({ success: true, resource: updated });
  } catch (err: any) {
    console.error('Error updating resource:', err);
    res.status(500).json({ error: 'Failed to update resource', details: err.message });
  }
});
