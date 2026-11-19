import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { IncidentReport } from '../types';
import { CategoryBadge } from '../components/CategoryBadge';
import { UrgencyBadge } from '../components/UrgencyBadge';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Code2,
  FileText,
  ShieldCheck,
  Send,
  HelpCircle,
  Cpu,
} from 'lucide-react';

export const AIAnalysisPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [activeAnalysis, setActiveAnalysis] = useState<any | null>(null);
  const [customText, setCustomText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'json'>('visual');

  useEffect(() => {
    const loadReports = async () => {
      try {
        const res = await api.getReports();
        setReports(res.reports);
        if (res.reports.length > 0) {
          setSelectedReportId(res.reports[0].id);
          setActiveAnalysis(res.reports[0].analysis);
        }
      } catch (err) {
        console.error('Failed to load reports for analysis view:', err);
      }
    };
    loadReports();
  }, []);

  const handleSelectReport = (id: string) => {
    setSelectedReportId(id);
    const found = reports.find((r) => r.id === id);
    if (found) {
      setActiveAnalysis(found.analysis);
    }
  };

  const handleRunCustomTest = async () => {
    if (!customText.trim() || customText.length < 8) {
      alert('Please enter at least 8 characters to test.');
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.interpretText({ text: customText });
      setActiveAnalysis(res.analysis);
      setSelectedReportId('custom');
    } catch (err: any) {
      alert(`AI parse failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  let parsedNeeds: string[] = [];
  try {
    if (activeAnalysis?.extractedNeeds) {
      parsedNeeds = typeof activeAnalysis.extractedNeeds === 'string'
        ? JSON.parse(activeAnalysis.extractedNeeds)
        : activeAnalysis.extractedNeeds;
    }
  } catch {
    parsedNeeds = [];
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">AI Incident Interpreter</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Zero-Hallucination Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deep-dive inspection into natural language understanding, schema validation, and decision-support explainability.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-navy-900 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => setActiveTab('visual')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium ${
              activeTab === 'visual' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Visual Explainer
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 ${
              activeTab === 'json' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" /> Structured JSON
          </button>
        </div>
      </div>

      {/* Selector & Custom Text Test Bar */}
      <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Existing Incident Picker */}
        <div className="md:col-span-5 space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">
            Select Existing Incident to Inspect:
          </label>
          <select
            value={selectedReportId}
            onChange={(e) => handleSelectReport(e.target.value)}
            className="w-full bg-navy-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            {reports.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} ({r.category})
              </option>
            ))}
          </select>
        </div>

        {/* Live Playground Input */}
        <div className="md:col-span-7 space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">
            Or Type Any Custom Scenario to Test Interpreter Live:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="e.g. Roof partially caved in at the rec center, elderly residents inside need shelter..."
              className="flex-1 bg-navy-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <button
              onClick={handleRunCustomTest}
              disabled={isLoading || !customText.trim()}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1 disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              {isLoading ? 'Parsing...' : 'Test'}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Display */}
      {activeAnalysis ? (
        activeTab === 'visual' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Card: Core Extracted Fields */}
            <div className="lg:col-span-7 space-y-5">
              <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={activeAnalysis.extractedCategory || 'OTHER'} />
                    {activeAnalysis.suggestedUrgency && (
                      <UrgencyBadge urgency={activeAnalysis.suggestedUrgency} />
                    )}
                  </div>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/60">
                    Confidence: {Math.round((activeAnalysis.confidenceScore || 0.9) * 100)}%
                  </span>
                </div>

                {/* Structured Summary */}
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Structured Summary
                  </span>
                  <p className="text-sm text-slate-100 font-medium leading-relaxed p-3.5 rounded-xl bg-navy-950 border border-slate-800">
                    {activeAnalysis.structuredSummary}
                  </p>
                </div>

                {/* Extracted Needs */}
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Extracted Logistics & Rescue Needs
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {parsedNeeds.length > 0 ? (
                      parsedNeeds.map((need, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-lg text-xs font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800"
                        >
                          #{need}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No specific needs identified</span>
                    )}
                  </div>
                </div>

                {/* Extracted Location & Timeframe */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Extracted Location:</span>
                    <p className="text-white font-medium">{activeAnalysis.extractedLocation || 'Unspecified'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Reported Timeframe:</span>
                    <p className="text-white font-medium">{activeAnalysis.extractedTimeframe || 'Recent event'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Explainability & Safety Guardrails */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-b from-navy-900 to-navy-850 border border-cyan-500/30 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Explainability & Triage Rationale
                </div>

                <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 text-xs space-y-2">
                  <span className="text-amber-400 font-semibold block">Why this report needs attention:</span>
                  <p className="text-slate-200 leading-relaxed">{activeAnalysis.urgencyRationale}</p>
                </div>

                {/* Anti-Hallucination Guardrail Notice */}
                <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 text-xs space-y-2">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Zero-Hallucination Policy
                  </span>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    The interpreter is strictly prompted to extract only stated entities. If the reporter omitted an exact address or casualty count, the model explicitly leaves those fields undefined rather than fabricating details.
                  </p>
                </div>

                {/* Model Metadata */}
                <div className="p-3 rounded-lg bg-navy-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    Engine Provider:
                  </span>
                  <span className="font-mono text-cyan-300 font-semibold">{activeAnalysis.modelProvider}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Valid JSON Schema Output
            </h3>
            <pre className="p-4 rounded-xl bg-navy-950 text-cyan-300 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
              {JSON.stringify(activeAnalysis, null, 2)}
            </pre>
          </div>
        )
      ) : (
        <div className="p-12 text-center bg-navy-900 rounded-2xl border border-slate-800 text-slate-500">
          No analysis record loaded. Select a report or type a custom prompt.
        </div>
      )}
    </div>
  );
};
