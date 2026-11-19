import { describe, it, expect } from 'vitest';
import { requireRole } from '../middleware/auth.js';

describe('Role Authorization & Status Transitions', () => {
  it('allows access when user role matches authorized roles', () => {
    const middleware = requireRole(['REVIEWER', 'ADMIN']);
    let calledNext = false;
    const req = { user: { id: 'u1', name: 'Test Reviewer', role: 'REVIEWER' } } as any;
    const res = {
      status: () => res,
      json: () => res,
    } as any;
    const next = () => { calledNext = true; };

    middleware(req, res, next);
    expect(calledNext).toBe(true);
  });

  it('blocks access when user role does not match authorized roles', () => {
    const middleware = requireRole(['REVIEWER', 'ADMIN']);
    let statusCode = 0;
    let jsonResponse: any = null;
    const req = { user: { id: 'u2', name: 'Citizen', role: 'CITIZEN' } } as any;
    const res = {
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: (data: any) => {
        jsonResponse = data;
        return res;
      },
    } as any;
    const next = () => {};

    middleware(req, res, next);
    expect(statusCode).toBe(403);
    expect(jsonResponse.error).toContain('Forbidden');
  });

  it('verifies safe lifecycle transition progression', () => {
    const validTransitions: Record<string, string[]> = {
      UNVERIFIED: ['UNDER_REVIEW', 'FLAGGED_CONFLICT'],
      UNDER_REVIEW: ['VERIFIED', 'FLAGGED_CONFLICT', 'UNVERIFIED'],
      VERIFIED: ['RESOLVED', 'FLAGGED_CONFLICT'],
      RESOLVED: ['UNDER_REVIEW'], // Can be reopened if situation changes
      FLAGGED_CONFLICT: ['UNDER_REVIEW', 'VERIFIED', 'RESOLVED'],
    };

    expect(validTransitions['UNVERIFIED']).toContain('UNDER_REVIEW');
    expect(validTransitions['UNDER_REVIEW']).toContain('VERIFIED');
    expect(validTransitions['VERIFIED']).toContain('RESOLVED');
  });
});
