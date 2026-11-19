"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resourcesRouter = void 0;
const express_1 = require("express");
const db_js_1 = require("../services/db.js");
const auth_js_1 = require("../middleware/auth.js");
const auditLogger_js_1 = require("../services/auditLogger.js");
exports.resourcesRouter = (0, express_1.Router)();
/**
 * GET /api/resources
 * List all relief and emergency coordination resources
 */
exports.resourcesRouter.get('/', async (req, res) => {
    try {
        const { type, status } = req.query;
        const where = {};
        if (type && type !== 'ALL')
            where.type = String(type);
        if (status && status !== 'ALL')
            where.status = String(status);
        const resources = await db_js_1.prisma.resource.findMany({
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
    }
    catch (err) {
        console.error('Error fetching resources:', err);
        res.status(500).json({ error: 'Failed to retrieve resources', details: err.message });
    }
});
/**
 * POST /api/resources
 * Register a new emergency resource
 */
exports.resourcesRouter.post('/', (0, auth_js_1.requireRole)(['COORDINATOR', 'ADMIN']), async (req, res) => {
    try {
        const { name, type, capacity, availableCount, location, contactPerson } = req.body;
        const resource = await db_js_1.prisma.resource.create({
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
        await (0, auditLogger_js_1.logAuditEvent)({
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
    }
    catch (err) {
        console.error('Error creating resource:', err);
        res.status(500).json({ error: 'Failed to register resource', details: err.message });
    }
});
/**
 * PATCH /api/resources/:id
 * Update resource status or count
 */
exports.resourcesRouter.patch('/:id', (0, auth_js_1.requireRole)(['COORDINATOR', 'ADMIN']), async (req, res) => {
    try {
        const id = String(req.params.id);
        const { status, availableCount, location } = req.body;
        const existing = await db_js_1.prisma.resource.findUnique({ where: { id } });
        if (!existing)
            return res.status(404).json({ error: 'Resource not found' });
        const updated = await db_js_1.prisma.resource.update({
            where: { id },
            data: {
                status: status || existing.status,
                availableCount: availableCount !== undefined ? Number(availableCount) : existing.availableCount,
                location: location || existing.location,
            },
        });
        res.json({ success: true, resource: updated });
    }
    catch (err) {
        console.error('Error updating resource:', err);
        res.status(500).json({ error: 'Failed to update resource', details: err.message });
    }
});
