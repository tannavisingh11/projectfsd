import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { IncidentReport } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { UrgencyBadge } from '../components/UrgencyBadge';
import { IncidentDetailModal } from '../components/IncidentDetailModal';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  MapPin,
  Clock,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  ArrowUpDown,
} from 'lucide-react';

export const ExplorerPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [timeFilter, setTimeFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string> = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (urgencyFilter !== 'ALL') params.urgency = urgencyFilter;
      if (timeFilter !== 'ALL') params.timeRange = timeFilter;

      const res = await api.getReports(params);
      setReports(res.reports);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [categoryFilter, statusFilter, urgencyFilter, timeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Incident Intelligence Explorer</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, filter, and inspect verified and incoming community submissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-navy-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs ${
                viewMode === 'grid' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs ${
                viewMode === 'table' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={fetchReports}
            className="p-2 rounded-lg bg-navy-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by keyword, landmark, or description..."
              className="w-full bg-navy-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow transition-colors"
          >
            Search
          </button>
        </form>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800/80 text-xs">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-navy-950 border border-slate-700 rounded-md py-1.5 px-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="ALL">All Categories</option>
              <option value="FLOOD">Flood</option>
              <option value="ROAD_HAZARD">Road Hazard</option>
              <option value="FIRE">Fire</option>
              <option value="UTILITY_OUTAGE">Utility Outage</option>
              <option value="SHELTER_REQUEST">Shelter & Needs</option>
              <option value="MEDICAL_EMERGENCY">Medical</option>
              <option value="STRUCTURAL_DAMAGE">Structural Damage</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-navy-950 border border-slate-700 rounded-md py-1.5 px-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="UNVERIFIED">Unverified</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="VERIFIED">Verified</option>
              <option value="RESOLVED">Resolved</option>
              <option value="FLAGGED_CONFLICT">Flagged Conflict</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Urgency</label>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full bg-navy-950 border border-slate-700 rounded-md py-1.5 px-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="ALL">All Urgencies</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Timeframe</label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full bg-navy-950 border border-slate-700 rounded-md py-1.5 px-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="ALL">All Time</option>
              <option value="24h">Past 24 Hours</option>
              <option value="3d">Past 3 Days</option>
              <option value="7d">Past 7 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-white">{reports.length}</strong> matching reports
        </span>
      </div>

      {/* Grid or Table Results */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className="p-5 rounded-2xl bg-navy-900 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer shadow-md hover:shadow-cyan-950/40 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <CategoryBadge category={report.category} />
                  <UrgencyBadge urgency={report.urgency} />
                </div>

                <h3 className="text-sm font-bold text-white mb-1.5 line-clamp-1">{report.title}</h3>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-3">
                  {report.rawDescription}
                </p>

                {report.analysis && (
                  <div className="p-2.5 rounded-lg bg-navy-950 border border-slate-800/80 mb-3 text-[11px]">
                    <div className="flex items-center gap-1 text-cyan-400 font-semibold mb-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" /> AI Summary
                    </div>
                    <p className="text-slate-400 line-clamp-2">{report.analysis.structuredSummary}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 text-slate-400 truncate max-w-[160px]">
                  <MapPin className="w-3 h-3 text-cyan-500 shrink-0" />
                  <span className="truncate">{report.locationName}</span>
                </div>
                <StatusBadge status={report.status} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-navy-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Title & Location</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white line-clamp-1">{report.title}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-cyan-500" />
                        {report.locationName}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <CategoryBadge category={report.category} />
                    </td>
                    <td className="py-3 px-4">
                      <UrgencyBadge urgency={report.urgency} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReport(report);
                        }}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for inspection */}
      <IncidentDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onReportUpdated={fetchReports}
      />
    </div>
  );
};
