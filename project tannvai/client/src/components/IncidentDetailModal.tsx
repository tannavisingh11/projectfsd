import React, { useState } from 'react';
import { IncidentReport } from '../types';
import { StatusBadge } from './StatusBadge';
import { CategoryBadge } from './CategoryBadge';
import { UrgencyBadge } from './UrgencyBadge';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import {
  X,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CopyCheck,
  History,
  CheckCircle,
  HelpCircle,
  Lock,
  MessageSquare,
} from 'lucide-react';

interface IncidentDetailModalProps {
  report: IncidentReport | null;
  onClose: () => void;
  onReportUpdated?: () => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  report,
  onClose,
  onReportUpdated,
}) => {
  const { canReview, role } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [conflictNotes, setConflictNotes] = useState('');
  const [showConflictInput, setShowConflictInput] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  if (!report) return null;

  const analysis = report.analysis;
  let parsedNeeds: string[] = [];
  try {
    if (analysis?.extractedNeeds) {
      parsedNeeds = JSON.parse(analysis.extractedNeeds);
    }
  } catch {
    parsedNeeds = [];
  }

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      await api.updateReportStatus(report.id, {
        status: newStatus,
        notes: reviewNotes || `Status updated to ${newStatus} by ${role}`,
      });
      if (onReportUpdated) onReportUpdated();
      onClose();
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFlagConflict = async () => {
    if (!conflictNotes.trim()) {
      alert('Please provide notes explaining the conflict.');
      return;
    }
    try {
      setIsUpdating(true);
      await api.updateReportStatus(report.id, {
        status: 'FLAGGED_CONFLICT',
        isConflicting: true,
        conflictNotes,
        notes: `Conflicting information flagged: ${conflictNotes}`,
      });
      if (onReportUpdated) onReportUpdated();
      onClose();
    } catch (err: any) {
      alert(`Failed to flag conflict: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-navy-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-800 bg-navy-950/50">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <CategoryBadge category={report.category} />
              <StatusBadge status={report.status} />
              <UrgencyBadge urgency={report.urgency} />
              {report.isConflicting && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-950 text-red-300 border border-red-700">
                  <AlertTriangle className="w-3 h-3 text-red-400" /> Conflicting Data
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{report.title}</h2>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                {report.locationName}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {new Date(report.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
          {/* Privacy & Contact Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-navy-950 border border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong>Privacy Protected:</strong> Reporter: {report.reporterName || 'Anonymous'} &bull; Contact:{' '}
                <span className="font-mono text-cyan-300">{report.reporterContact || 'Confidential'}</span>
              </span>
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:inline">PII protected by ResQNet Privacy Shield</span>
          </div>

          {/* Raw Citizen Submission */}
          <div className="p-4 rounded-xl bg-navy-850 border border-slate-800/80">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              Original Community Report
            </h3>
            <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{report.rawDescription}</p>
          </div>

          {/* AI Incident Interpreter Section */}
          {analysis && (
            <div className="p-5 rounded-xl bg-gradient-to-br from-navy-850 to-slate-900 border border-cyan-500/30 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-cyan-500/20 text-cyan-300 text-[10px] font-mono rounded-bl-lg border-l border-b border-cyan-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                {analysis.modelProvider}
              </div>

              <h3 className="text-sm font-bold text-cyan-300 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                AI Incident Interpreter Analysis
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-4">
                <div className="p-3 rounded-lg bg-navy-950/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Structured Summary:</span>
                  <p className="text-slate-200 font-medium">{analysis.structuredSummary}</p>
                </div>
                <div className="p-3 rounded-lg bg-navy-950/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Urgency Rationale (Decision Support):</span>
                  <p className="text-slate-200">{analysis.urgencyRationale}</p>
                </div>
              </div>

              {/* Extracted Needs Pills */}
              <div className="mb-4">
                <span className="text-xs font-semibold text-slate-400 block mb-2">Extracted Critical Needs:</span>
                <div className="flex flex-wrap gap-2">
                  {parsedNeeds.length > 0 ? (
                    parsedNeeds.map((need, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-cyan-950 text-cyan-300 border border-cyan-800/60"
                      >
                        #{need}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No specific resource needs stated</span>
                  )}
                </div>
              </div>

              {/* Confidence & Explainability Indicator */}
              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Model Confidence:</span>
                  <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full"
                      style={{ width: `${Math.round(analysis.confidenceScore * 100)}%` }}
                    ></div>
                  </div>
                  <span className="font-mono text-cyan-300 font-semibold">
                    {Math.round(analysis.confidenceScore * 100)}%
                  </span>
                </div>
                <div className="text-[11px] text-amber-400/90 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  Details unverified until human review
                </div>
              </div>
            </div>
          )}

          {/* Duplicate Suggestions */}
          {((report.primaryDuplicates && report.primaryDuplicates.length > 0) ||
            (report.matchedDuplicates && report.matchedDuplicates.length > 0)) && (
            <div className="p-4 rounded-xl bg-navy-950 border border-amber-500/30">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <CopyCheck className="w-4 h-4 text-amber-400" />
                Duplicate Detection Engine Matched Report
              </h3>
              {report.primaryDuplicates?.map((dup) => (
                <div key={dup.id} className="text-xs text-slate-300 space-y-1.5 p-3 rounded-lg bg-navy-900 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">
                      Matched with: {dup.matchedReport?.title || dup.matchedReportId}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[11px]">
                      {Math.round(dup.similarityScore * 100)}% Match
                    </span>
                  </div>
                  <p className="text-slate-400">{dup.matchRationale}</p>
                  <div className="text-[11px] text-slate-500">Status: {dup.status}</div>
                </div>
              ))}
            </div>
          )}

          {/* Audit History */}
          {report.auditLogs && report.auditLogs.length > 0 && (
            <div className="p-4 rounded-xl bg-navy-950 border border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <History className="w-3.5 h-3.5 text-slate-400" />
                Audit Trail & History
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {report.auditLogs.map((log) => (
                  <div key={log.id} className="text-xs p-2 rounded bg-navy-900/80 border border-slate-800/80 flex items-start justify-between gap-3">
                    <div>
                      <span className="font-semibold text-cyan-300">{log.action}</span> by{' '}
                      <span className="text-slate-300">{log.performedByName}</span> ({log.performedByRole})
                      {log.notes && <p className="text-slate-400 mt-0.5">{log.notes}</p>}
                    </div>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions (Reviewer / Coordinator / Admin) */}
        {canReview && (
          <div className="p-4 border-t border-slate-800 bg-navy-950 flex flex-col gap-3">
            {showConflictInput && (
              <div className="space-y-2">
                <textarea
                  value={conflictNotes}
                  onChange={(e) => setConflictNotes(e.target.value)}
                  placeholder="Describe the conflicting information or dispute..."
                  className="w-full text-xs p-2.5 rounded-lg bg-navy-900 border border-red-500/50 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-400"
                  rows={2}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowConflictInput(false)}
                    className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFlagConflict}
                    disabled={isUpdating}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg shadow"
                  >
                    Confirm Conflict Flag
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-slate-400">
                Logged in as: <strong className="text-cyan-400">{role}</strong>
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {report.status !== 'VERIFIED' && (
                  <button
                    onClick={() => handleUpdateStatus('VERIFIED')}
                    disabled={isUpdating}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verify Report
                  </button>
                )}
                {report.status !== 'RESOLVED' && (
                  <button
                    onClick={() => handleUpdateStatus('RESOLVED')}
                    disabled={isUpdating}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Mark Resolved
                  </button>
                )}
                {!showConflictInput && (
                  <button
                    onClick={() => setShowConflictInput(true)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-700/60 flex items-center gap-1.5 transition-colors"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Flag Conflict
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
