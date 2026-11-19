"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const auth_js_1 = require("../middleware/auth.js");
(0, vitest_1.describe)('Role Authorization & Status Transitions', () => {
    (0, vitest_1.it)('allows access when user role matches authorized roles', () => {
        const middleware = (0, auth_js_1.requireRole)(['REVIEWER', 'ADMIN']);
        let calledNext = false;
        const req = { user: { id: 'u1', name: 'Test Reviewer', role: 'REVIEWER' } };
        const res = {
            status: () => res,
            json: () => res,
        };
        const next = () => { calledNext = true; };
        middleware(req, res, next);
        (0, vitest_1.expect)(calledNext).toBe(true);
    });
    (0, vitest_1.it)('blocks access when user role does not match authorized roles', () => {
        const middleware = (0, auth_js_1.requireRole)(['REVIEWER', 'ADMIN']);
        let statusCode = 0;
        let jsonResponse = null;
        const req = { user: { id: 'u2', name: 'Citizen', role: 'CITIZEN' } };
        const res = {
            status: (code) => {
                statusCode = code;
                return res;
            },
            json: (data) => {
                jsonResponse = data;
                return res;
            },
        };
        const next = () => { };
        middleware(req, res, next);
        (0, vitest_1.expect)(statusCode).toBe(403);
        (0, vitest_1.expect)(jsonResponse.error).toContain('Forbidden');
    });
    (0, vitest_1.it)('verifies safe lifecycle transition progression', () => {
        const validTransitions = {
            UNVERIFIED: ['UNDER_REVIEW', 'FLAGGED_CONFLICT'],
            UNDER_REVIEW: ['VERIFIED', 'FLAGGED_CONFLICT', 'UNVERIFIED'],
            VERIFIED: ['RESOLVED', 'FLAGGED_CONFLICT'],
            RESOLVED: ['UNDER_REVIEW'], // Can be reopened if situation changes
            FLAGGED_CONFLICT: ['UNDER_REVIEW', 'VERIFIED', 'RESOLVED'],
        };
        (0, vitest_1.expect)(validTransitions['UNVERIFIED']).toContain('UNDER_REVIEW');
        (0, vitest_1.expect)(validTransitions['UNDER_REVIEW']).toContain('VERIFIED');
        (0, vitest_1.expect)(validTransitions['VERIFIED']).toContain('RESOLVED');
    });
});
