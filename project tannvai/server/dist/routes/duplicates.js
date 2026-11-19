"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.duplicatesRouter = void 0;
const express_1 = require("express");
const db_js_1 = require("../services/db.js");
const auth_js_1 = require("../middleware/auth.js");
const validation_js_1 = require("../middleware/validation.js");
const auditLogger_js_1 = require("../services/auditLogger.js");
exports.duplicatesRouter = (0, express_1.Router)();
/**
 * GET /api/duplicates
 * List duplicate suggestions
 */
exports.duplicatesRouter.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};
        if (status && status !== 'ALL') {
            where.status = String(status);
        }
        const suggestions = await db_js_1.prisma.duplicateSuggestion.findMany({
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
    }
    catch (err) {
        console.error('Error fetching duplicate suggestions:', err);
        res.status(500).json({ error: 'Failed to fetch duplicate suggestions', details: err.message });
    }
});
/**
 * POST /api/duplicates/:id/review
 * Human reviewer confirms or rejects duplicate suggestion
 * Requires REVIEWER or ADMIN role
 */
exports.duplicatesRouter.post('/:id/review', (0, auth_js_1.requireRole)(['REVIEWER', 'ADMIN']), (0, validation_js_1.validateBody)(validation_js_1.reviewDuplicateSchema), async (req, res) => {
    try {
        const id = String(req.params.id);
        const { status, reviewNotes } = req.body;
        const existing = await db_js_1.prisma.duplicateSuggestion.findUnique({
            where: { id },
            include: { primaryReport: true, matchedReport: true },
        });
        if (!existing) {
            return res.status(404).json({ error: 'Duplicate suggestion not found' });
        }
        const updated = await db_js_1.prisma.duplicateSuggestion.update({
            where: { id },
            data: {
                status,
                reviewNotes,
                reviewedById: req.user?.id,
            },
        });
        // If confirmed as duplicate, update matched report status or conflict notes
        if (status === 'CONFIRMED_DUPLICATE') {
            await db_js_1.prisma.incidentReport.update({
                where: { id: existing.matchedReportId },
                data: {
                    conflictNotes: `Linked as duplicate of primary incident: "${existing.primaryReport.title}" (${existing.primaryReport.id})`,
                },
            });
        }
        // Log audit trail
        await (0, auditLogger_js_1.logAuditEvent)({
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
    }
    catch (err) {
        console.error('Error reviewing duplicate suggestion:', err);
        res.status(500).json({ error: 'Failed to record duplicate review decision', details: err.message });
    }
});
