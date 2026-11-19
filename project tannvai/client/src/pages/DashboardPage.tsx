import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { IncidentReport, DashboardStats } from '../types';
import { MapView } from '../components/MapView';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { UrgencyBadge } from '../components/UrgencyBadge';
import { IncidentDetailModal } from '../components/IncidentDetailModal';
import {
  ShieldAlert,
  AlertCircle,
  Clock,
  CheckCircle2,
  Users2,
  Truck,
  PlusCircle,
  RefreshCw,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export const DashboardPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, reportsRes] = await Promise.all([
        api.getStats(),
        api.getReports(filterCategory !== 'ALL' ? { category: filterCategory } : undefined),
      ]);
      setStats(statsRes);
      setReports(reportsRes.reports);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterCategory]);

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Live Incident Dashboard</h1>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-mono text-emerald-400 font-semibold uppercase">Live Feed</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time geospatial intelligence, incident triage status, and community response coordination.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-2 rounded-lg bg-navy-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <button
            onClick={() => onNavigate('submit')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-950 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Submit Community Report
          </button>
        </div>
      </div>

      {/* KPI Cards Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Incidents */}
        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Total Reports</span>
            <span className="text-2xl font-extrabold text-white font-mono mt-0.5 block">
              {stats?.summary.totalReports ?? reports.length}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">Across all categories</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Verification */}
        <div className="p-4 rounded-xl bg-navy-900 border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-300 block">Pending Triage</span>
            <span className="text-2xl font-extrabold text-amber-400 font-mono mt-0.5 block">
              {stats?.summary.pendingVerification ?? 0}
            </span>
            <span className="text-[10px] text-amber-400/70 block mt-1">Requires human review</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Active Help Requests */}
        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Active Requests</span>
            <span className="text-2xl font-extrabold text-cyan-400 font-mono mt-0.5 block">
              {stats?.summary.activeRequests ?? 0}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">Water, Food, Evac</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Users2 className="w-5 h-5" />
          </div>
        </div>

        {/* Deployed Resources */}
        <div className="p-4 rounded-xl bg-navy-900 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-300 block">Resources Deployed</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5 block">
              {stats?.summary.deployedUnits ?? 0}
            </span>
            <span className="text-[10px] text-emerald-400/70 block mt-1">
              {stats?.summary.availableUnits ?? 0} units available
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Truck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map (Left) + Live Stream (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Geospatial Incident Map
              </span>
              <span className="text-xs text-slate-500">({reports.length} plotted)</span>
            </div>

            {/* Quick Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-navy-900 border border-slate-700 text-xs rounded-lg py-1 px-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="ALL">All Categories</option>
              <option value="FLOOD">Floods</option>
              <option value="ROAD_HAZARD">Road Hazards</option>
              <option value="UTILITY_OUTAGE">Utility Outages</option>
              <option value="SHELTER_REQUEST">Shelter & Needs</option>
              <option value="FIRE">Fire</option>
            </select>
          </div>

          <MapView
            reports={reports}
            selectedReportId={selectedReport?.id}
            onSelectReport={(r) => setSelectedReport(r)}
            height="520px"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 px-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Flood
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Road Hazard
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> Utility
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Shelter
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-amber-400"></span> Unverified halo
              </span>
            </div>
            <button
              onClick={() => onNavigate('explorer')}
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              Full Explorer <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Live Reports Stream (Right) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Recent Activity Stream
            </span>
            <button
              onClick={() => onNavigate('explorer')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {reports.length === 0 ? (
              <div className="p-8 text-center bg-navy-900 rounded-xl border border-slate-800 text-slate-500 text-xs">
                No reports matching filter criteria.
              </div>
            ) : (
              reports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedReport?.id === report.id
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md shadow-cyan-950'
                      : 'bg-navy-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <CategoryBadge category={report.category} />
                    <UrgencyBadge urgency={report.urgency} />
                  </div>

                  <h3 className="text-xs font-bold text-white line-clamp-1">{report.title}</h3>

                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {report.rawDescription}
                  </p>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1 truncate max-w-[160px]">
                      <MapPin className="w-3 h-3 text-cyan-500 shrink-0" />
                      <span className="truncate">{report.locationName}</span>
                    </span>
                    <StatusBadge status={report.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Report Detail Modal */}
      <IncidentDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onReportUpdated={fetchData}
      />
    </div>
  );
};
