import React from 'react';
import { useDemo } from '../context/DemoContext';
import {
  ShieldAlert,
  Sparkles,
  MapPin,
  CopyCheck,
  Users2,
  Lock,
  ArrowRight,
  PlayCircle,
  Activity,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';

export const LandingPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { loadScenario } = useDemo();

  const handleLaunchDemo = async () => {
    await loadScenario();
    onNavigate('dashboard');
  };

  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-navy-900 via-navy-850 to-navy-950 border border-slate-800 p-8 sm:p-14 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            NEXT-GENERATION EMERGENCY INTELLIGENCE
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            Transforming Community Chaos Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Actionable Emergency Intelligence</span>.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light">
            During disasters, reports flood in from everywhere—incomplete, duplicate, misleading, or without clear locations.
            <strong> ResQNet AI</strong> standardizes natural-language community reports into structured, verified incident intelligence, detects duplicates, coordinates relief, and maintains human-in-the-loop auditability.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={handleLaunchDemo}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all transform active:scale-95"
            >
              <PlayCircle className="w-5 h-5" />
              Launch Live Hackathon Demo
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-navy-850 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors"
            >
              Explore Live Dashboard
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">0.89</div>
            <div className="text-xs text-slate-400 mt-1">Duplicate Match Threshold</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">&lt; 300ms</div>
            <div className="text-xs text-slate-400 mt-1">AI Structured Extraction</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">100%</div>
            <div className="text-xs text-slate-400 mt-1">PII Shield & Privacy</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono">Audit Log</div>
            <div className="text-xs text-slate-400 mt-1">Full Decision History</div>
          </div>
        </div>
      </section>

      {/* 5 Core Innovations Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Five Connected Capabilities
          </h2>
          <p className="text-sm text-slate-400">
            Engineered specifically to solve real-world emergency communication bottlenecks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. AI Interpreter */}
          <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">1. AI Incident Interpreter</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ingests raw natural language. Extracts category, approximate coordinates, and concrete logistical needs. Produces explainable urgency rationale without hallucination.
            </p>
            <div className="text-[11px] text-cyan-400 font-semibold pt-1 flex items-center gap-1">
              Marked unverified by default &bull; Human in the loop
            </div>
          </div>

          {/* 2. Smart Map */}
          <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 hover:border-blue-500/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">2. Smart Geospatial Incident Map</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive OpenStreetMap canvas with dynamic category pins, pulsing urgency halos, and review state rings. Click to inspect with zero PII exposure to public viewers.
            </p>
            <div className="text-[11px] text-blue-400 font-semibold pt-1 flex items-center gap-1">
              Filter by category, urgency & time
            </div>
          </div>

          {/* 3. Duplicate Detection */}
          <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 hover:border-amber-500/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <CopyCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">3. Duplicate Report Detection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-factor matching combining geodesic distance, temporal window, and semantic tokens. Suggests corroborations with transparent rationale instead of destructive merging.
            </p>
            <div className="text-[11px] text-amber-400 font-semibold pt-1 flex items-center gap-1">
              Reviewer confirms, links, or rejects
            </div>
          </div>

          {/* 4. Help Coordination */}
          <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Users2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">4. Community Help Coordination</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct community requests for potable water, food, evacuation, and shelter. Field coordinators assign available squads and track live status progression through resolution.
            </p>
            <div className="text-[11px] text-emerald-400 font-semibold pt-1 flex items-center gap-1">
              Submitted &rarr; Under Review &rarr; Assigned &rarr; Resolved
            </div>
          </div>

          {/* 5. Trust & Verification */}
          <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 hover:border-purple-500/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">5. Trust, Privacy & Audit Trail</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Distinguishes unverified, reviewed, and confirmed reports. Flags conflicting information for human resolution and records every status change in an immutable audit ledger.
            </p>
            <div className="text-[11px] text-purple-400 font-semibold pt-1 flex items-center gap-1">
              Full transparency & PII masking
            </div>
          </div>

          {/* Quick Demo CTA Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-navy-900 border border-cyan-500/40 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">Self-Contained Demo</span>
              <h3 className="text-base font-bold text-white mt-1">Ready for Demonstration</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Step through the entire end-to-end simulation: submit, parse, detect duplicate, verify, and dispatch in under 2 minutes.
              </p>
            </div>
            <button
              onClick={handleLaunchDemo}
              className="w-full py-2.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center gap-1.5 shadow transition-colors"
            >
              <PlayCircle className="w-4 h-4" />
              Start 2-Minute Demo Flow
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
