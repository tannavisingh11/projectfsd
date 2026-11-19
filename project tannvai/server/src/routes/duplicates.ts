import { Router, Request, Response } from 'express';
import { prisma } from '../services/db.js';
import { requireRole } from '../middleware/auth.js';
import { validateBody, reviewDuplicateSchema } from '../middleware/validation.js';
import { logAuditEvent } from '../services/auditLogger.js';

export const duplicatesRouter = Router();

/**
 * GET /api/duplicates
 * List duplicate suggestions
 */
duplicatesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = String(status);
    }

    const suggestions = await prisma.duplicateSuggestion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        primaryReport: {
          select: {
            id: true,
            title: true,
            rawDescription: true,
            category: true,
            status: true,
            urgency: true,
            locationName: true,
            latitude: true,
            longitude: true,
            createdAt: true,
          },
        },
        matchedReport: {
          select: {
            id: true,
            title: true,
            rawDescription: true,
            category: true,
            status: true,
            urgency: true,
            locationName: true,
            latitude: true,
            longitude: true,
            createdAt: true,
          },
        },
      },
    });

    res.json({ suggestions });
  } catch (err: any) {
    console.error('Error fetching duplicate suggestions:', err);
    res.status(500).json({ error: 'Failed to fetch duplicate suggestions', details: err.message });
  }
});

/**
 * POST /api/duplicates/:id/review
 * Human reviewer confirms or rejects duplicate suggestion
 * Requires REVIEWER or ADMIN role
 */
duplicatesRouter.post(
  '/:id/review',
  requireRole(['REVIEWER', 'ADMIN']),
  validateBody(reviewDuplicateSchema),
  async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const { status, reviewNotes } = req.body;

      const existing = await prisma.duplicateSuggestion.findUnique({
        where: { id },
        include: { primaryReport: true, matchedReport: true },
      });

      if (!existing) {
        return res.status(404).json({ error: 'Duplicate suggestion not found' });
      }

      const updated = await prisma.duplicateSuggestion.update({
        where: { id },
        data: {
          status,
          reviewNotes,
          reviewedById: req.user?.id,
        },
      });

      // If confirmed as duplicate, update matched report status or conflict notes
      if (status === 'CONFIRMED_DUPLICATE') {
        await prisma.incidentReport.update({
          where: { id: existing.matchedReportId },
          data: {
            conflictNotes: `Linked as duplicate of primary incident: "${existing.primaryReport.title}" (${existing.primaryReport.id})`,
          },
        });
      }

      // Log audit trail
      await logAuditEvent({
        entityType: 'DUPLICATE',
        entityId: id,
        action: status === 'REJECTED' ? 'DUPLICATE_REJECTED' : 'DUPLICATE_LINKED',
        performedById: req.user?.id,
        performedByName: req.user?.name || 'Reviewer',
        performedByRole: req.user?.role || 'REVIEWER',
        previousState: { status: existing.status },
        newState: { status: updated.status, reviewNotes },
        notes: `Reviewer ruling on duplicate suggestion: ${status}. Notes: ${reviewNotes}`,
      });

      res.json({ success: true, suggestion: updated });
    } catch (err: any) {
      console.error('Error reviewing duplicate suggestion:', err);
      res.status(500).json({ error: 'Failed to record duplicate review decision', details: err.message });
    }
  }
);
