import React from 'react';
import { UrgencyLevel } from '../types';
import { AlertOctagon, Flame, ArrowUpCircle, Info } from 'lucide-react';

export const UrgencyBadge: React.FC<{ urgency: UrgencyLevel | string; className?: string }> = ({
  urgency,
  className = '',
}) => {
  switch (urgency) {
    case 'CRITICAL':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold tracking-wide uppercase bg-red-600/20 text-red-400 border border-red-500/50 shadow-sm shadow-red-900/40 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping mr-0.5"></span>
          <AlertOctagon className="w-3 h-3 text-red-400" />
          Critical
        </span>
      );
    case 'HIGH':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold tracking-wide uppercase bg-amber-600/20 text-amber-400 border border-amber-500/40 ${className}`}
        >
          <Flame className="w-3 h-3 text-amber-400" />
          High
        </span>
      );
    case 'MEDIUM':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium uppercase bg-blue-600/20 text-blue-400 border border-blue-500/30 ${className}`}
        >
          <ArrowUpCircle className="w-3 h-3 text-blue-400" />
          Medium
        </span>
      );
    case 'LOW':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium uppercase bg-slate-800 text-slate-400 border border-slate-700 ${className}`}
        >
          <Info className="w-3 h-3 text-slate-400" />
          Low
        </span>
      );
  }
};
