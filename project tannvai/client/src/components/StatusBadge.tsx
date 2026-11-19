import React from 'react';
import { IncidentStatus } from '../types';
import { AlertCircle, Clock, CheckCircle2, CheckCheck, AlertTriangle } from 'lucide-react';

export const StatusBadge: React.FC<{ status: IncidentStatus | string; className?: string }> = ({
  status,
  className = '',
}) => {
  switch (status) {
    case 'UNVERIFIED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 ${className}`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          Unverified
        </span>
      );
    case 'UNDER_REVIEW':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30 ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          Under Review
        </span>
      );
    case 'VERIFIED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Verified
        </span>
      );
    case 'RESOLVED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/30 ${className}`}
        >
          <CheckCheck className="w-3.5 h-3.5 text-purple-400" />
          Resolved
        </span>
      );
    case 'FLAGGED_CONFLICT':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/30 ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          Flagged Conflict
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 ${className}`}
        >
          {status}
        </span>
      );
  }
};
