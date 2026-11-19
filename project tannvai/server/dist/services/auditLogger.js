"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAuditEvent = logAuditEvent;
const db_js_1 = require("./db.js");
async function logAuditEvent(params) {
    try {
        return await db_js_1.prisma.auditLog.create({
            data: {
                entityType: params.entityType,
                entityId: params.entityId,
                action: params.action,
                performedById: params.performedById,
                performedByName: params.performedByName || 'System',
                performedByRole: params.performedByRole || 'SYSTEM',
                previousState: params.previousState ? JSON.stringify(params.previousState) : null,
                newState: params.newState ? JSON.stringify(params.newState) : null,
                notes: params.notes,
            },
        });
    }
    catch (err) {
        console.error('⚠️ Failed to write audit log entry:', err);
        return null;
    }
}
