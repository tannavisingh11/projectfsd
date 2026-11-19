import { Router, Request, Response } from 'express';
import { prisma } from '../services/db.js';
import { validateBody, createReportSchema, updateReportStatusSchema } from '../middleware/validation.js';
import { requireRole } from '../middleware/auth.js';
import { interpretIncidentReport } from '../services/aiInterpreter.js';
import { evaluateDuplicateMatch } from '../services/duplicateDetector.js';
import { logAuditEvent } from '../services/auditLogger.js';

export const reportsRouter = Router();

/**
 * GET /api/reports
 * Search & filter incident reports
 */
reportsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { category, status, urgency, search, timeRange } = req.query;

    const where: any = {};

    if (category && category !== 'ALL') {
      where.category = String(category);
    }
    if (status && status !== 'ALL') {
      where.status = String(status);
    }
    if (urgency && urgency !== 'ALL') {
      where.urgency = String(urgency);
    }
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { title: { contains: q } },
        { rawDescription: { contains: q } },
        { locationName: { contains: q } },
      ];
    }
    if (timeRange) {
      const now = new Date();
      if (timeRange === '24h') {
        where.createdAt = { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
      } else if (timeRange === '3d') {
        where.createdAt = { gte: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) };
      } else if (timeRange === '7d') {
        where.createdAt = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
      }
    }

    const reports = await prisma.incidentReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        analysis: true,
        helpRequests: { select: { id: true, requestType: true, status: true, peopleCount: true } },
        primaryDuplicates: { select: { id: true, similarityScore: true, status: true } },
        matchedDuplicates: { select: { id: true, similarityScore: true, status: true } },
      },
    });

    // Redact reporterContact for public/citizen view
    const isPrivileged = req.user && ['REVIEWER', 'COORDINATOR', 'ADMIN'].includes(req.user.role);
    const sanitizedReports = reports.map((r) => ({
      ...r,
      reporterContact: isPrivileged ? r.reporterContact : (r.reporterContact ? '[Confidential - Responder Access Only]' : null),
    }));

    res.json({ reports: sanitizedReports });
  } catch (err: any) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: 'Failed to retrieve reports', details: err.message });
  }
});

/**
 * GET /api/reports/:id
 * Retrieve a single report with its analysis, duplicate suggestions, and audit history
 */
reportsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const report = await prisma.incidentReport.findUnique({
      where: { id },
      include: {
        analysis: true,
        helpRequests: {
          include: {
            assignments: {
              include: { resource: true },
            },
          },
        },
        primaryDuplicates: {
          include: { matchedReport: { select: { id: true, title: true, category: true, status: true, createdAt: true, locationName: true } } },
        },
        matchedDuplicates: {
          include: { primaryReport: { select: { id: true, title: true, category: true, status: true, createdAt: true, locationName: true } } },
        },
        verifiedBy: { select: { id: true, name: true, role: true } },
      },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Fetch audit logs for this incident
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        OR: [
          { entityId: report.id },
          { entityId: report.analysis?.id || 'none' },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const isPrivileged = req.user && ['REVIEWER', 'COORDINATOR', 'ADMIN'].includes(req.user.role);
    const sanitizedReport = {
      ...report,
      reporterContact: isPrivileged ? report.reporterContact : (report.reporterContact ? '[Confidential - Responder Access Only]' : null),
      auditLogs,
    };

    res.json({ report: sanitizedReport });
  } catch (err: any) {
    console.error('Error fetching report:', err);
    res.status(500).json({ error: 'Failed to retrieve report details', details: err.message });
  }
});

/**
 * POST /api/reports
 * Submit a community incident report, trigger AI analysis, and run duplicate detection
 */
reportsRouter.post('/', validateBody(createReportSchema), async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // 1. Run AI Interpreter
    const aiAnalysis = await interpretIncidentReport(
      body.rawDescription,
      body.locationName,
      body.category
    );

    // Initial status is UNVERIFIED until reviewed
    const initialStatus = 'UNVERIFIED';
    const urgency = body.urgency || aiAnalysis.suggestedUrgency || 'MEDIUM';
    const finalCategory = body.category || aiAnalysis.extractedCategory || 'OTHER';

    // 2. Create the incident report record in database
    const report = await prisma.incidentReport.create({
      data: {
        title: body.title,
        rawDescription: body.rawDescription,
        category: finalCategory,
        status: initialStatus,
        urgency,
        locationName: body.locationName,
        latitude: body.latitude,
        longitude: body.longitude,
        imageUrl: body.imageUrl || null,
        reporterName: body.reporterName || 'Anonymous Citizen',
        reporterContact: body.reporterContact || null,
        reporterConsent: body.reporterConsent,
        reporterId: req.user?.id !== 'simulated-user-id' ? req.user?.id : null,
      },
    });

    // 3. Create the analysis record linked to the report
    const analysis = await prisma.incidentAnalysis.create({
      data: {
        reportId: report.id,
        extractedCategory: aiAnalysis.extractedCategory,
        extractedNeeds: JSON.stringify(aiAnalysis.extractedNeeds),
        extractedLocation: aiAnalysis.extractedLocation,
        extractedTimeframe: aiAnalysis.extractedTimeframe,
        structuredSummary: aiAnalysis.structuredSummary,
        urgencyRationale: aiAnalysis.urgencyRationale,
        confidenceScore: aiAnalysis.confidenceScore,
        modelProvider: aiAnalysis.modelProvider,
        isVerified: false,
      },
    });

    // 4. Log creation audit event
    await logAuditEvent({
      entityType: 'INCIDENT',
      entityId: report.id,
      action: 'CREATED',
      performedById: req.user?.id,
      performedByName: req.user?.name || body.reporterName || 'Community Member',
      performedByRole: req.user?.role || 'CITIZEN',
      newState: { status: report.status, category: report.category, urgency: report.urgency },
      notes: 'Initial community report submission via ResQNet portal.',
    });

    await logAuditEvent({
      entityType: 'ANALYSIS',
      entityId: analysis.id,
      action: 'CREATED',
      performedByName: aiAnalysis.modelProvider,
      performedByRole: 'SYSTEM',
      newState: {
        extractedCategory: aiAnalysis.extractedCategory,
        confidenceScore: aiAnalysis.confidenceScore,
        needs: aiAnalysis.extractedNeeds,
      },
      notes: 'AI Incident Interpreter parsed report. Extracted details marked unverified.',
    });

    // 5. Automated Duplicate Report Detection
    // Compare against active or recent reports (within last 48 hours)
    const recentReports = await prisma.incidentReport.findMany({
      where: {
        id: { not: report.id },
        createdAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
      },
      select: {
        id: true,
        title: true,
        rawDescription: true,
        category: true,
        latitude: true,
        longitude: true,
        createdAt: true,
      },
    });

    const detectedDuplicates: any[] = [];
    for (const existing of recentReports) {
      const matchResult = evaluateDuplicateMatch(
        {
          id: report.id,
          title: report.title,
          rawDescription: report.rawDescription,
          category: report.category,
          latitude: report.latitude,
          longitude: report.longitude,
          createdAt: report.createdAt,
        },
        existing
      );

      if (matchResult.isMatch) {
        const suggestion = await prisma.duplicateSuggestion.create({
          data: {
            primaryReportId: existing.id,
            matchedReportId: report.id,
            similarityScore: matchResult.similarityScore,
            distanceMeters: matchResult.distanceMeters,
            matchRationale: matchResult.matchRationale,
            status: 'PENDING',
          },
        });

        await logAuditEvent({
          entityType: 'DUPLICATE',
          entityId: suggestion.id,
          action: 'CREATED',
          performedByName: 'ResQNet-Duplicate-Engine',
          performedByRole: 'SYSTEM',
          newState: {
            primaryReportId: existing.id,
            matchedReportId: report.id,
            similarityScore: matchResult.similarityScore,
          },
          notes: matchResult.matchRationale,
        });

        detectedDuplicates.push({
          id: suggestion.id,
          matchedWithReportId: existing.id,
          similarityScore: matchResult.similarityScore,
          matchRationale: matchResult.matchRationale,
        });
      }
    }

    res.status(201).json({
      success: true,
      report,
      analysis,
      detectedDuplicates,
      missingInformationNotes: aiAnalysis.missingInformationNotes,
    });
  } catch (err: any) {
    console.error('Error submitting report:', err);
    res.status(500).json({ error: 'Failed to submit incident report', details: err.message });
  }
});

/**
 * PATCH /api/reports/:id/status
 * Update report verification status (UNVERIFIED, UNDER_REVIEW, VERIFIED, RESOLVED, FLAGGED_CONFLICT)
 * Requires REVIEWER, COORDINATOR, or ADMIN role
 */
reportsRouter.patch(
  '/:id/status',
  requireRole(['REVIEWER', 'COORDINATOR', 'ADMIN']),
  validateBody(updateReportStatusSchema),
  async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const { status, notes, isConflicting, conflictNotes } = req.body;

      const existing = await prisma.incidentReport.findUnique({
        where: { id },
        include: { analysis: true },
      });

      if (!existing) {
        return res.status(404).json({ error: 'Report not found' });
      }

      const isVerifiedStatus = status === 'VERIFIED';
      const updated = await prisma.incidentReport.update({
        where: { id },
        data: {
          status,
          isConflicting: isConflicting !== undefined ? isConflicting : existing.isConflicting,
          conflictNotes: conflictNotes !== undefined ? conflictNotes : existing.conflictNotes,
          verifiedAt: isVerifiedStatus ? new Date() : existing.verifiedAt,
          verifiedById: isVerifiedStatus ? req.user?.id : existing.verifiedById,
        },
      });

      // Update analysis isVerified flag if report is verified
      if (existing.analysis && isVerifiedStatus) {
        await prisma.incidentAnalysis.update({
          where: { id: existing.analysis.id },
          data: { isVerified: true },
        });
      }

      // Log status transition audit trail
      await logAuditEvent({
        entityType: 'INCIDENT',
        entityId: id,
        action: isVerifiedStatus ? 'VERIFIED' : 'STATUS_CHANGED',
        performedById: req.user?.id,
        performedByName: req.user?.name || 'Reviewer',
        performedByRole: req.user?.role || 'REVIEWER',
        previousState: { status: existing.status, isConflicting: existing.isConflicting },
        newState: { status: updated.status, isConflicting: updated.isConflicting },
        notes: notes || (isConflicting ? `Conflict flagged: ${conflictNotes}` : `Status updated to ${status}`),
      });

      res.json({ success: true, report: updated });
    } catch (err: any) {
      console.error('Error updating status:', err);
      res.status(500).json({ error: 'Failed to update report status', details: err.message });
    }
  }
);
