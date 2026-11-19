import React from 'react';
import { IncidentCategory } from '../types';
import {
  Waves,
  AlertTriangle,
  Flame,
  Zap,
  HeartPulse,
  Home,
  Building2,
  Radio,
} from 'lucide-react';

export const CategoryBadge: React.FC<{ category: IncidentCategory | string; className?: string }> = ({
  category,
  className = '',
}) => {
  switch (category) {
    case 'FLOOD':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-cyan-950/50 text-cyan-300 border border-cyan-800/50 ${className}`}
        >
          <Waves className="w-3.5 h-3.5 text-cyan-400" />
          Flood
        </span>
      );
    case 'ROAD_HAZARD':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-950/50 text-amber-300 border border-amber-800/50 ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          Road Hazard
        </span>
      );
    case 'FIRE':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-950/50 text-red-300 border border-red-800/50 ${className}`}
        >
          <Flame className="w-3.5 h-3.5 text-red-400" />
          Fire
        </span>
      );
    case 'UTILITY_OUTAGE':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-yellow-950/50 text-yellow-300 border border-yellow-800/50 ${className}`}
        >
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          Utility Outage
        </span>
      );
    case 'MEDICAL_EMERGENCY':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-rose-950/50 text-rose-300 border border-rose-800/50 ${className}`}
        >
          <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
          Medical
        </span>
      );
    case 'SHELTER_REQUEST':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-950/50 text-emerald-300 border border-emerald-800/50 ${className}`}
        >
          <Home className="w-3.5 h-3.5 text-emerald-400" />
          Shelter / Basic Needs
        </span>
      );
    case 'STRUCTURAL_DAMAGE':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-950/50 text-indigo-300 border border-indigo-800/50 ${className}`}
        >
          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
          Structural Damage
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-900 text-slate-300 border border-slate-700 ${className}`}
        >
          <Radio className="w-3.5 h-3.5 text-slate-400" />
          {category}
        </span>
      );
  }
};
