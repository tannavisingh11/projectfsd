import React from 'react';
import {
  ShieldAlert,
  Sparkles,
  Lock,
  AlertTriangle,
  Cpu,
  Layers,
  CheckCircle2,
  FileCheck,
  Users2,
  Scale,
} from 'lucide-react';

export const AboutPage: React.FC<{ onNavigate: (page: string) => void }> = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4">
      {/* Page Header */}
      <div className="space-y-2 border-b border-slate-800 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          SYSTEM METHODOLOGY & ETHICAL AI SAFEGUARDS
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          How ResQNet AI Works
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Technical specifications, zero-hallucination pipelines, duplicate detection heuristics, privacy architecture, and operational evaluation criteria.
        </p>
      </div>

      {/* Architecture & Pipeline Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          1. End-to-End System Architecture
        </h2>

        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-6">
          <p className="text-xs text-slate-300 leading-relaxed">
            ResQNet AI connects five synchronized modules to convert chaotic natural-language emergency reports into structured, auditable decision intelligence:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
              <span className="font-mono text-cyan-400 font-bold block">Stage 1: Ingestion</span>
              <h3 className="font-bold text-white">Community Capture</h3>
              <p className="text-slate-400 leading-relaxed">
                Accepts unstructured text from mobile, web, and radio transcription. Captures approximate landmarks with optional map coordinate pinning and privacy consent.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
              <span className="font-mono text-cyan-400 font-bold block">Stage 2: Inference</span>
              <h3 className="font-bold text-white">AI Incident Interpreter</h3>
              <p className="text-slate-400 leading-relaxed">
                Applies schema-constrained structured extraction to identify categories, needs, and urgency rationale without hallucination. Details marked UNVERIFIED.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
              <span className="font-mono text-cyan-400 font-bold block">Stage 3: Coordination</span>
              <h3 className="font-bold text-white">Duplicate & Dispatch</h3>
              <p className="text-slate-400 leading-relaxed">
                Geospatial & token similarity engine evaluates duplicates. Coordinators review and dispatch relief squads with full audit trail logging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Duplicate Detection Algorithm Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-amber-400" />
          2. Multi-Factor Duplicate Detection Algorithm
        </h2>

        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            Rather than relying solely on raw text embedding or rigid radius queries, ResQNet uses a composite multi-factor scoring function:
          </p>

          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 font-mono text-[11px] space-y-2 text-cyan-300">
            <div>Score = (Spatial_Score * 0.35) + (Semantic_Text_Score * 0.35) + (Category_Match * 0.15) + (Temporal_Proximity * 0.15)</div>
            <div className="text-slate-400 text-[10px] pt-1">
              &bull; Spatial: Haversine distance (&lt;100m = 1.0, &lt;400m = 0.85, &lt;1.2km = 0.6)
              <br />
              &bull; Semantic Text: Tokenized Jaccard similarity boosted by critical emergency entity overlap
              <br />
              &bull; Temporal: Time difference (&lt;45 min = 1.0, &lt;3 hrs = 0.8, &lt;12 hrs = 0.5)
            </div>
          </div>

          <p>
            <strong>Explainability Rule:</strong> When a duplicate suggestion is triggered (threshold &ge; 0.65), ResQNet automatically produces a plain-English explanation of why the match was detected and requires an authorized human reviewer to confirm, link, or reject the relationship.
          </p>
        </div>
      </section>

      {/* Privacy Architecture & Zero-Hallucination Policy */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-400" />
          3. Privacy Architecture & PII Protection
        </h2>

        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 p-4 rounded-xl bg-navy-950 border border-slate-800">
              <h3 className="font-bold text-emerald-400">PII Shield & Access Control</h3>
              <p className="text-slate-400">
                Citizen phone numbers and private email addresses are <strong>never</strong> rendered on public map markers, popups, or public API responses. Only authenticated Coordinators and Admins have access to responder contact records.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-navy-950 border border-slate-800">
              <h3 className="font-bold text-cyan-400">Zero-Hallucination Guarantee</h3>
              <p className="text-slate-400">
                The model is explicitly forbidden from inventing missing details. If an address, casualty count, or need is not in the text, it is explicitly flagged as unspecified rather than fabricated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Limitations & Ethical Disclaimer */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
          4. Known Limitations & Responsible Operations
        </h2>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-navy-900 to-rose-950/20 border border-rose-500/30 space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            &bull; <strong>Decision Support Only:</strong> AI-generated urgency scores are advisory prioritization aids and must never be treated as authoritative rulings on emergency severity without human confirmation.
          </p>
          <p>
            &bull; <strong>Offline / Demo Mode:</strong> In offline environments where paid LLM API keys are unavailable, ResQNet seamlessly transitions to its deterministic rule-guided semantic parser without breaking functionality or fabricating predictions.
          </p>
          <p>
            &bull; <strong>Human in the Loop:</strong> Reports remain marked UNVERIFIED until reviewed, and an immutable audit trail records every state transition.
          </p>
        </div>
      </section>
    </div>
  );
};
