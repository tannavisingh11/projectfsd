import { Request, Response, NextFunction } from 'express';

export type UserRole = 'CITIZEN' | 'COORDINATOR' | 'REVIEWER' | 'ADMIN';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Flexible middleware that parses user role from headers or defaults to CITIZEN
 * Allows judges and testers to switch personas with one click in the UI!
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const roleHeader = (req.header('x-user-role') || 'CITIZEN').toUpperCase() as UserRole;
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

function getDefaultNameForRole(role: UserRole): string {
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
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
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
