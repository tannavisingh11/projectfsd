import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { DashboardStats } from '../types';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Info,
} from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  FLOOD: '#06b6d4',
  ROAD_HAZARD: '#f59e0b',
  FIRE: '#ef4444',
  UTILITY_OUTAGE: '#eab308',
  MEDICAL_EMERGENCY: '#f43f5e',
  SHELTER_REQUEST: '#10b981',
  STRUCTURAL_DAMAGE: '#8b5cf6',
  OTHER: '#64748b',
};

const STATUS_COLORS: Record<string, string> = {
  UNVERIFIED: '#f59e0b',
  UNDER_REVIEW: '#3b82f6',
  VERIFIED: '#10b981',
  RESOLVED: '#8b5cf6',
  FLAGGED_CONFLICT: '#ef4444',
};

export const AnalyticsPage: React.FC<{ onNavigate: (page: string) => void }> = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await api.getStats();
      setStats(res);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Emergency Intelligence Analytics</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              DEMO DATASET ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry, categorization breakdowns, resolution pipelines, and response trend analysis.
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="p-2 rounded-lg bg-navy-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Dataset Label Banner */}
      <div className="p-3 rounded-xl bg-navy-900 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            Demonstration metrics reflect simulated events in the Riverdale / Metro Bay operational sector.
          </span>
        </div>
        <span className="text-[11px] font-mono text-cyan-400">Sample Size: {stats?.summary.totalReports || 6} Incidents</span>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">Avg Triage Speed</span>
          <span className="text-2xl font-extrabold text-cyan-400 font-mono mt-1 block">14.2 min</span>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">&darr; 42% faster with AI triage</span>
        </div>
        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">Duplicate Noise Reduction</span>
          <span className="text-2xl font-extrabold text-emerald-400 font-mono mt-1 block">38.5%</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Corroborated duplicates identified</span>
        </div>
        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">AI Parsing Latency</span>
          <span className="text-2xl font-extrabold text-white font-mono mt-1 block">280 ms</span>
          <span className="text-[10px] text-cyan-400 mt-0.5 block">Schema validated JSON</span>
        </div>
        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">Verification Rate</span>
          <span className="text-2xl font-extrabold text-purple-400 font-mono mt-1 block">
            {stats ? Math.round(((stats.summary.verifiedCount + stats.summary.resolvedCount) / Math.max(1, stats.summary.totalReports)) * 100) : 75}%
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Human confirmed reports</span>
        </div>
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Incidents by Emergency Category
            </h2>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.categoryDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {(stats?.categoryDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#06b6d4'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pipeline Pie Chart */}
        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              Incident Verification Pipeline
            </h2>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.statusDistribution || []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                  label={({ status, percent }) => `${status} (${(percent * 100).toFixed(0)}%)`}
                >
                  {(stats?.statusDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ingestion Timeline Area Chart */}
        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Incident Ingestion Timeline (Hourly Inflow)
            </h2>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.timelineData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="reports" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorReports)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
