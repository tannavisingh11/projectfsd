import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';
import { setApiUserContext } from '../utils/api';

interface AuthContextType {
  role: UserRole;
  userName: string;
  setRole: (role: UserRole) => void;
  canReview: boolean;
  canAssign: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('REVIEWER'); // Default to Reviewer for convenient hackathon demo inspection
  const [userName, setUserName] = useState<string>('Marcus Vance (Reviewer EMT-P)');

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    let name = 'Community Member';
    if (newRole === 'ADMIN') name = 'Director Sarah Chen (Admin)';
    else if (newRole === 'REVIEWER') name = 'Marcus Vance (Reviewer EMT-P)';
    else if (newRole === 'COORDINATOR') name = 'Elena Rostova (Field Coordinator)';
    
    setUserName(name);
    setApiUserContext(newRole, `user-${newRole.toLowerCase()}`, name);
  };

  useEffect(() => {
    setApiUserContext(role, `user-${role.toLowerCase()}`, userName);
  }, []);

  const canReview = role === 'REVIEWER' || role === 'ADMIN';
  const canAssign = role === 'COORDINATOR' || role === 'ADMIN';
  const isAdmin = role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ role, userName, setRole, canReview, canAssign, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
