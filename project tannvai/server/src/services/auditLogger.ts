import { prisma } from './db.js';

export interface CreateAuditLogParams {
  entityType: 'INCIDENT' | 'ANALYSIS' | 'DUPLICATE' | 'HELP_REQUEST' | 'ASSIGNMENT' | 'SYSTEM';
  entityId: string;
  action:
    | 'CREATED'
    | 'UPDATED'
    | 'VERIFIED'
    | 'STATUS_CHANGED'
    | 'DUPLICATE_LINKED'
    | 'DUPLICATE_REJECTED'
    | 'RESOURCE_ASSIGNED'
    | 'CONFLICT_FLAGGED'
    | 'RESOLVED';
  performedById?: string;
  performedByName?: string;
  performedByRole?: string;
  previousState?: any;
  newState?: any;
  notes?: string;
}

export async function logAuditEvent(params: CreateAuditLogParams) {
  try {
    return await prisma.auditLog.create({
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
  } catch (err) {
    console.error('⚠️ Failed to write audit log entry:', err);
    return null;
  }
}
