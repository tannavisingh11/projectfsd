import React from 'react';
import { ShieldAlert, Heart, Lock, AlertTriangle } from 'lucide-react';

export const Footer: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-navy-950 border-t border-slate-800/80 text-slate-400 text-xs py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Responsible AI Disclaimer Banner */}
        <div className="p-3.5 rounded-xl bg-navy-900 border border-slate-800 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-slate-300 leading-relaxed text-[11px]">
            <strong>Important Safety & Ethical AI Notice:</strong> ResQNet AI operates as a decision-support and triage acceleration system for civic responders.
            AI-extracted summaries, categories, and urgency scores are advisory indicators and are strictly marked unverified until inspected and confirmed by authorized human coordinators.
            The platform does not auto-dispatch real-world emergency services without human review.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/60">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200">ResQNet AI</span>
            <span>&bull; Community Emergency Intelligence Network</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button onClick={() => onNavigate('landing')} className="hover:text-cyan-400 transition-colors">
              Home
            </button>
            <button onClick={() => onNavigate('dashboard')} className="hover:text-cyan-400 transition-colors">
              Dashboard
            </button>
            <button onClick={() => onNavigate('about')} className="hover:text-cyan-400 transition-colors">
              Methodology & Privacy
            </button>
            <span className="flex items-center gap-1 text-slate-500">
              <Lock className="w-3 h-3 text-cyan-500" /> PII Shield Active
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
