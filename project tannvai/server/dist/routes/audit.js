"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditRouter = void 0;
const express_1 = require("express");
const db_js_1 = require("../services/db.js");
exports.auditRouter = (0, express_1.Router)();
/**
 * GET /api/audit
 * Inspect full transparency audit trail
 */
exports.auditRouter.get('/', async (req, res) => {
    try {
        const { entityType, action, limit } = req.query;
        const where = {};
        if (entityType && entityType !== 'ALL')
            where.entityType = String(entityType);
        if (action && action !== 'ALL')
            where.action = String(action);
        const logs = await db_js_1.prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit ? Math.min(100, Number(limit)) : 50,
            include: {
                performedBy: { select: { id: true, name: true, role: true } },
            },
        });
        res.json({ logs });
    }
    catch (err) {
        console.error('Error fetching audit logs:', err);
        res.status(500).json({ error: 'Failed to retrieve audit logs', details: err.message });
    }
});
