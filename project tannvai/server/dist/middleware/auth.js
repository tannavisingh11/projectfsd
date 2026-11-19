"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.requireRole = requireRole;
/**
 * Flexible middleware that parses user role from headers or defaults to CITIZEN
 * Allows judges and testers to switch personas with one click in the UI!
 */
function authMiddleware(req, res, next) {
    const roleHeader = (req.header('x-user-role') || 'CITIZEN').toUpperCase();
    const userId = req.header('x-user-id') || 'simulated-user-id';
    const userName = req.header('x-user-name') || getDefaultNameForRole(roleHeader);
    req.user = {
        id: userId,
        name: userName,
        email: `${roleHeader.toLowerCase()}@resqnet.org`,
        role: roleHeader,
    };
    next();
}
function getDefaultNameForRole(role) {
    switch (role) {
        case 'ADMIN':
            return 'Director Sarah Chen (Admin)';
        case 'REVIEWER':
            return 'Marcus Vance (Reviewer EMT-P)';
        case 'COORDINATOR':
            return 'Elena Rostova (Field Coordinator)';
        case 'CITIZEN':
        default:
            return 'Community Member';
    }
}
/**
 * Enforces role-based permissions
 */
function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Forbidden: Insufficient privileges',
                requiredRoles: allowedRoles,
                currentRole: req.user?.role || 'NONE',
            });
        }
        next();
    };
}
