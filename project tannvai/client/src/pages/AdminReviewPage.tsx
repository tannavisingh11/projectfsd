import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { IncidentReport, DuplicateSuggestion, AuditLog } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { UrgencyBadge } from '../components/UrgencyBadge';
import {
  ShieldCheck,
  CopyCheck,
  History,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Lock,
} from 'lucide-react';

export const AdminReviewPage: React.FC<{ onNavigate: (page: string) => void }> = () => {
  const { role, canReview } = useAuth();
  const [activeTab, setActiveTab] = useState<'duplicates' | 'unverified' | 'audit'>('duplicates');
  const [duplicates, setDuplicates] = useState<DuplicateSuggestion[]>([]);
  const [unverifiedReports, setUnverifiedReports] = useState<IncidentReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Duplicate Ruling Form State
  const [selectedDuplicateId, setSelectedDuplicateId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [isSubmittingRuling, setIsSubmittingRuling] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [dupRes, repRes, auditRes] = await Promise.all([
        api.getDuplicates(),
        api.getReports({ status: 'UNVERIFIED' }),
        api.getAuditLogs({ limit: '30' }),
      ]);
      setDuplicates(dupRes.suggestions);
      setUnverifiedReports(repRes.reports);
      setAuditLogs(auditRes.logs);
    } catch (err) {
      console.error('Error fetching admin review data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDuplicateRuling = async (
    suggestionId: string,
    status: 'CONFIRMED_DUPLICATE' | 'CORROBORATING_REPORT' | 'REJECTED'
  ) => {
    try {
      setIsSubmittingRuling(true);
      const notes = reviewNotes.trim() || `Reviewer ${role} confirmed ruling: ${status}`;
      await api.reviewDuplicate(suggestionId, { status, reviewNotes: notes });
      setSelectedDuplicateId(null);
      setReviewNotes('');
      fetchData();
    } catch (err: any) {
      alert(`Duplicate review failed: ${err.message}`);
    } finally {
      setIsSubmittingRuling(false);
    }
  };

  const handleVerifyReport = async (reportId: string) => {
    try {
      await api.updateReportStatus(reportId, {
        status: 'VERIFIED',
        notes: `Verified by triage officer (${role})`,
      });
      fetchData();
    } catch (err: any) {
      alert(`Verification failed: ${err.message}`);
    }
  };

  const pendingDuplicates = duplicates.filter((d) => d.status === 'PENDING');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Triage & Review Console</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Role: {role}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Resolve automated duplicate suggestions, verify community submissions, and audit system decisions.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="p-2 rounded-lg bg-navy-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Role Notice */}
      {!canReview && (
        <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-500/40 text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>
              You are currently viewing as <strong>Citizen</strong>. Switch persona to <strong>Reviewer</strong> or{' '}
              <strong>Admin</strong> in the top navbar to execute verification decisions.
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('duplicates')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold transition-all ${
            activeTab === 'duplicates'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <CopyCheck className="w-4 h-4" />
          Duplicate Suggestions ({pendingDuplicates.length} pending)
        </button>

        <button
          onClick={() => setActiveTab('unverified')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold transition-all ${
            activeTab === 'unverified'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          Unverified Reports Queue ({unverifiedReports.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold transition-all ${
            activeTab === 'audit'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          Audit Ledger ({auditLogs.length} events)
        </button>
      </div>

      {/* Tab 1: Duplicate Suggestions */}
      {activeTab === 'duplicates' && (
        <div className="space-y-4">
          {duplicates.length === 0 ? (
            <div className="p-12 text-center bg-navy-900 rounded-2xl border border-slate-800 text-slate-500 text-xs">
              No duplicate report suggestions at this time.
            </div>
          ) : (
            duplicates.map((sug) => {
              const isPending = sug.status === 'PENDING';
              return (
                <div
                  key={sug.id}
                  className={`p-6 rounded-2xl border transition-all ${
                    isPending
                      ? 'bg-navy-900 border-amber-500/40 shadow-lg shadow-amber-950/20'
                      : 'bg-navy-950/60 border-slate-800 opacity-80'
                  }`}
                >
                  {/* Top Match Score & Proximity */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
                        {Math.round(sug.similarityScore * 100)}% Similarity Match
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Distance: {Math.round(sug.distanceMeters)}m apart
                      </span>
                    </div>

                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        isPending
                          ? 'bg-amber-950 text-amber-400 border border-amber-700'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                      }`}
                    >
                      Status: {sug.status}
                    </span>
                  </div>

                  {/* Explainable AI Match Rationale */}
                  <div className="my-3 p-3 rounded-xl bg-navy-950 border border-slate-800 text-xs text-slate-300">
                    <span className="text-cyan-400 font-semibold block mb-0.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Detection Rationale:
                    </span>
                    <p className="leading-relaxed">{sug.matchRationale}</p>
                  </div>

                  {/* Side-by-Side Report Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs my-4">
                    {/* Primary Report */}
                    <div className="p-4 rounded-xl bg-navy-950/70 border border-slate-800 space-y-2">
                      <span className="text-[10px] uppercase font-mono font-bold text-cyan-400 block">
                        Existing / Primary Report
                      </span>
                      <h4 className="font-bold text-white text-sm">
                        {sug.primaryReport?.title || sug.primaryReportId}
                      </h4>
                      <div className="flex items-center gap-2">
                        {sug.primaryReport && <CategoryBadge category={sug.primaryReport.category} />}
                        <span className="text-slate-400 text-[11px]">{sug.primaryReport?.locationName}</span>
                      </div>
                      <p className="text-slate-300 text-xs line-clamp-3 leading-relaxed">
                        {sug.primaryReport?.rawDescription}
                      </p>
                    </div>

                    {/* Candidate Matched Report */}
                    <div className="p-4 rounded-xl bg-navy-950/70 border border-slate-800 space-y-2">
                      <span className="text-[10px] uppercase font-mono font-bold text-amber-400 block">
                        Incoming Candidate Duplicate
                      </span>
                      <h4 className="font-bold text-white text-sm">
                        {sug.matchedReport?.title || sug.matchedReportId}
                      </h4>
                      <div className="flex items-center gap-2">
                        {sug.matchedReport && <CategoryBadge category={sug.matchedReport.category} />}
                        <span className="text-slate-400 text-[11px]">{sug.matchedReport?.locationName}</span>
                      </div>
                      <p className="text-slate-300 text-xs line-clamp-3 leading-relaxed">
                        {sug.matchedReport?.rawDescription}
                      </p>
                    </div>
                  </div>

                  {/* Review Decision Actions */}
                  {isPending && canReview && (
                    <div className="pt-3 border-t border-slate-800 space-y-3">
                      <input
                        type="text"
                        value={selectedDuplicateId === sug.id ? reviewNotes : ''}
                        onChange={(e) => {
                          setSelectedDuplicateId(sug.id);
                          setReviewNotes(e.target.value);
                        }}
                        placeholder="Add review decision rationale (e.g. Confirmed same underpass flooding incident)..."
                        className="w-full bg-navy-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />

                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <button
                          onClick={() => handleDuplicateRuling(sug.id, 'REJECTED')}
                          disabled={isSubmittingRuling}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          Reject Match (Distinct Incident)
                        </button>

                        <button
                          onClick={() => handleDuplicateRuling(sug.id, 'CORROBORATING_REPORT')}
                          disabled={isSubmittingRuling}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700 flex items-center gap-1.5 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                          Link as Corroborating Report
                        </button>

                        <button
                          onClick={() => handleDuplicateRuling(sug.id, 'CONFIRMED_DUPLICATE')}
                          disabled={isSubmittingRuling}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 shadow transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Confirm Duplicate
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Unverified Reports Queue */}
      {activeTab === 'unverified' && (
        <div className="space-y-3">
          {unverifiedReports.length === 0 ? (
            <div className="p-12 text-center bg-navy-900 rounded-2xl border border-slate-800 text-slate-500 text-xs">
              All community submissions have been triaged and verified!
            </div>
          ) : (
            unverifiedReports.map((report) => (
              <div
                key={report.id}
                className="p-5 rounded-2xl bg-navy-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={report.category} />
                    <UrgencyBadge urgency={report.urgency} />
                    <StatusBadge status={report.status} />
                  </div>
                  <h3 className="text-sm font-bold text-white">{report.title}</h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{report.rawDescription}</p>
                  <span className="text-[11px] text-slate-500 block">
                    Location: {report.locationName} &bull; Submitted:{' '}
                    {new Date(report.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                {canReview && (
                  <button
                    onClick={() => handleVerifyReport(report.id)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shrink-0 shadow"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verify Incident
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Audit Ledger */}
      {activeTab === 'audit' && (
        <div className="bg-navy-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Immutable Audit Trail</span>
            <span className="text-slate-500">Records all verification, duplicate rulings, and dispatch actions</span>
          </div>

          <div className="divide-y divide-slate-800 text-xs max-h-[520px] overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-400">{log.action}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                      {log.entityType}
                    </span>
                    <span className="text-slate-400">
                      by <strong>{log.performedByName}</strong> ({log.performedByRole})
                    </span>
                  </div>
                  {log.notes && <p className="text-slate-300 text-xs">{log.notes}</p>}
                </div>
                <span className="text-[11px] text-slate-500 whitespace-nowrap font-mono">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
