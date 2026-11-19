"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestsRouter = void 0;
const express_1 = require("express");
const db_js_1 = require("../services/db.js");
const auth_js_1 = require("../middleware/auth.js");
const validation_js_1 = require("../middleware/validation.js");
const auditLogger_js_1 = require("../services/auditLogger.js");
exports.requestsRouter = (0, express_1.Router)();
/**
 * GET /api/requests
 * List community help requests with filtering
 */
exports.requestsRouter.get('/', async (req, res) => {
    try {
        const { status, type } = req.query;
        const where = {};
        if (status && status !== 'ALL')
            where.status = String(status);
        if (type && type !== 'ALL')
            where.requestType = String(type);
        const requests = await db_js_1.prisma.helpRequest.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                report: {
                    select: {
                        id: true,
                        title: true,
                        locationName: true,
                        latitude: true,
                        longitude: true,
                        status: true,
                    },
                },
                assignments: {
                    include: {
                        resource: true,
                        assignedBy: { select: { id: true, name: true, role: true } },
                    },
                },
            },
        });
        const isPrivileged = req.user && ['REVIEWER', 'COORDINATOR', 'ADMIN'].includes(req.user.role);
        const sanitized = requests.map((r) => ({
            ...r,
            requesterContact: isPrivileged ? r.requesterContact : (r.requesterContact ? '[Confidential - Responder Access Only]' : null),
        }));
        res.json({ requests: sanitized });
    }
    catch (err) {
        console.error('Error fetching help requests:', err);
        res.status(500).json({ error: 'Failed to retrieve help requests', details: err.message });
    }
});
/**
 * POST /api/requests
 * Submit a community help request
 */
exports.requestsRouter.post('/', (0, validation_js_1.validateBody)(validation_js_1.createHelpRequestSchema), async (req, res) => {
    try {
        const body = req.body;
        const request = await db_js_1.prisma.helpRequest.create({
            data: {
                reportId: body.reportId || null,
                requestType: body.requestType,
                description: body.description,
                urgency: body.urgency || 'MEDIUM',
                status: 'SUBMITTED',
                peopleCount: body.peopleCount || 1,
                specialNeeds: body.specialNeeds || null,
                requesterName: body.requesterName || 'Community Member',
                requesterContact: body.requesterContact || null,
            },
        });
        await (0, auditLogger_js_1.logAuditEvent)({
            entityType: 'HELP_REQUEST',
            entityId: request.id,
            action: 'CREATED',
            performedById: req.user?.id,
            performedByName: req.user?.name || body.requesterName,
            performedByRole: req.user?.role || 'CITIZEN',
            newState: { requestType: request.requestType, status: request.status, urgency: request.urgency },
            notes: `Help request registered for ${request.requestType} assistance (${request.peopleCount} individuals).`,
        });
        res.status(201).json({ success: true, request });
    }
    catch (err) {
        console.error('Error submitting help request:', err);
        res.status(500).json({ error: 'Failed to submit help request', details: err.message });
    }
});
/**
 * PATCH /api/requests/:id/status
 * Update request workflow status (SUBMITTED -> UNDER_REVIEW -> VERIFIED -> ASSIGNED -> RESOLVED)
 */
exports.requestsRouter.patch('/:id/status', (0, auth_js_1.requireRole)(['COORDINATOR', 'REVIEWER', 'ADMIN']), async (req, res) => {
    try {
        const id = String(req.params.id);
        const { status, notes } = req.body;
        const validStatuses = ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'RESOLVED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value', validStatuses });
        }
        const existing = await db_js_1.prisma.helpRequest.findUnique({ where: { id } });
        if (!existing)
            return res.status(404).json({ error: 'Help request not found' });
        const updated = await db_js_1.prisma.helpRequest.update({
            where: { id },
            data: { status },
        });
        await (0, auditLogger_js_1.logAuditEvent)({
            entityType: 'HELP_REQUEST',
            entityId: id,
            action: status === 'RESOLVED' ? 'RESOLVED' : 'STATUS_CHANGED',
            performedById: req.user?.id,
            performedByName: req.user?.name || 'Coordinator',
            performedByRole: req.user?.role || 'COORDINATOR',
            previousState: { status: existing.status },
            newState: { status: updated.status },
            notes: notes || `Request transitioned from ${existing.status} to ${status}.`,
        });
        res.json({ success: true, request: updated });
    }
    catch (err) {
        console.error('Error updating help request status:', err);
        res.status(500).json({ error: 'Failed to update request status', details: err.message });
    }
});
/**
 * POST /api/requests/:id/assign
 * Coordinator assigns an available resource or squad to a help request
 */
exports.requestsRouter.post('/:id/assign', (0, auth_js_1.requireRole)(['COORDINATOR', 'ADMIN']), (0, validation_js_1.validateBody)(validation_js_1.assignResourceSchema), async (req, res) => {
    try {
        const id = String(req.params.id);
        const { resourceId, notes } = req.body;
        const helpRequest = await db_js_1.prisma.helpRequest.findUnique({ where: { id } });
        if (!helpRequest)
            return res.status(404).json({ error: 'Help request not found' });
        const resource = await db_js_1.prisma.resource.findUnique({ where: { id: resourceId } });
        if (!resource)
            return res.status(404).json({ error: 'Resource not found' });
        // Create Assignment
        const assignment = await db_js_1.prisma.assignment.create({
            data: {
                helpRequestId: id,
                resourceId,
                assignedById: req.user?.id,
                status: 'ASSIGNED',
                notes: notes || `Assigned to request: ${helpRequest.description.substring(0, 60)}...`,
            },
            include: { resource: true },
        });
        // Update Help Request status to ASSIGNED
        const updatedRequest = await db_js_1.prisma.helpRequest.update({
            where: { id },
            data: { status: 'ASSIGNED' },
        });
        // Update Resource status to DEPLOYED
        const updatedResource = await db_js_1.prisma.resource.update({
            where: { id: resourceId },
            data: {
                status: 'DEPLOYED',
                availableCount: Math.max(0, resource.availableCount - 1),
            },
        });
        // Log audit
        await (0, auditLogger_js_1.logAuditEvent)({
            entityType: 'ASSIGNMENT',
            entityId: assignment.id,
            action: 'RESOURCE_ASSIGNED',
            performedById: req.user?.id,
            performedByName: req.user?.name || 'Coordinator',
            performedByRole: req.user?.role || 'COORDINATOR',
            newState: {
                requestId: id,
                resourceName: resource.name,
                resourceType: resource.type,
                assignmentStatus: assignment.status,
            },
            notes: `Assigned "${resource.name}" to request. ${notes || ''}`,
        });
        res.status(201).json({
            success: true,
            assignment,
            helpRequest: updatedRequest,
            resource: updatedResource,
        });
    }
    catch (err) {
        console.error('Error assigning resource:', err);
        res.status(500).json({ error: 'Failed to assign resource', details: err.message });
    }
});
/**
 * PATCH /api/requests/assignments/:assignmentId/status
 * Update assignment status (ASSIGNED -> EN_ROUTE -> ON_SCENE -> COMPLETED -> CANCELLED)
 */
exports.requestsRouter.patch('/assignments/:assignmentId/status', (0, auth_js_1.requireRole)(['COORDINATOR', 'ADMIN']), async (req, res) => {
    try {
        const assignmentId = String(req.params.assignmentId);
        const { status, notes } = req.body;
        const existing = await db_js_1.prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: { helpRequest: true, resource: true },
        });
        if (!existing)
            return res.status(404).json({ error: 'Assignment not found' });
        const isCompleted = status === 'COMPLETED';
        const updated = await db_js_1.prisma.assignment.update({
            where: { id: assignmentId },
            data: {
                status,
                notes: notes ? `${existing.notes || ''} | ${notes}` : existing.notes,
                completedAt: isCompleted ? new Date() : existing.completedAt,
            },
            include: { resource: true },
        });
        // If completed or cancelled, free up resource
        if (isCompleted || status === 'CANCELLED') {
            await db_js_1.prisma.resource.update({
                where: { id: existing.resourceId },
                data: {
                    status: 'AVAILABLE',
                    availableCount: existing.resource.availableCount + 1,
                },
            });
            if (isCompleted && existing.helpRequestId) {
                await db_js_1.prisma.helpRequest.update({
                    where: { id: existing.helpRequestId },
                    data: { status: 'RESOLVED' },
                });
            }
        }
        await (0, auditLogger_js_1.logAuditEvent)({
            entityType: 'ASSIGNMENT',
            entityId: assignmentId,
            action: isCompleted ? 'RESOLVED' : 'STATUS_CHANGED',
            performedById: req.user?.id,
            performedByName: req.user?.name,
            performedByRole: req.user?.role,
            previousState: { status: existing.status },
            newState: { status: updated.status },
            notes: `Assignment status updated to ${status}.`,
        });
        res.json({ success: true, assignment: updated });
    }
    catch (err) {
        console.error('Error updating assignment status:', err);
        res.status(500).json({ error: 'Failed to update assignment', details: err.message });
    }
});
