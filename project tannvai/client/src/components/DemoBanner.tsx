import React, { useState } from 'react';
import { useDemo, DEMO_STEPS } from '../context/DemoContext';
import { PlayCircle, ArrowRight, ArrowLeft, RotateCcw, ChevronDown, ChevronUp, Sparkles, CheckCircle2 } from 'lucide-react';

export const DemoBanner: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { activeStep, goToStep, nextStep, prevStep, loadScenario, resetDemo, isLoading, statusMessage } = useDemo();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const currentStepData = DEMO_STEPS[activeStep - 1] || DEMO_STEPS[0];

  const handleStepClick = (stepNum: number) => {
    goToStep(stepNum);
  };

  return (
    <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border-b border-cyan-500/30 text-white shadow-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              HACKATHON PRESENTATION MODE
            </div>
            <span className="text-xs text-slate-300 hidden md:inline">
              Step <strong className="text-cyan-400">{activeStep}</strong> of {DEMO_STEPS.length}:{' '}
              <span className="text-white font-medium">{currentStepData.title}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadScenario()}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow transition-all active:scale-95 disabled:opacity-50"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              Load Scenario
            </button>

            <button
              onClick={() => resetDemo()}
              disabled={isLoading}
              title="Reset simulation"
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="mt-2 text-xs py-1 px-3 bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 rounded-md">
            {statusMessage}
          </div>
        )}

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-800/80">
            {/* Step Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 mb-3">
              {DEMO_STEPS.map((s) => {
                const isActive = s.step === activeStep;
                const isCompleted = s.step < activeStep;
                return (
                  <button
                    key={s.step}
                    onClick={() => handleStepClick(s.step)}
                    className={`text-left p-2 rounded-lg border transition-all text-xs ${
                      isActive
                        ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-sm shadow-cyan-950'
                        : isCompleted
                        ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        : 'bg-navy-950/40 border-slate-800/60 text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-mono text-[10px] uppercase font-bold text-cyan-400">Step {s.step}</span>
                      {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    </div>
                    <div className="font-semibold truncate text-[11px]">{s.badge}</div>
                  </button>
                );
              })}
            </div>

            {/* Current Step Walkthrough Details & Fast Nav */}
            <div className="flex items-center justify-between bg-navy-950/70 p-3 rounded-lg border border-slate-800 text-xs">
              <div className="pr-4">
                <span className="text-cyan-400 font-semibold block mb-0.5">{currentStepData.title}:</span>
                <p className="text-slate-300 leading-relaxed">{currentStepData.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={prevStep}
                  disabled={activeStep === 1}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate(currentStepData.routeHint)}
                  className="px-2.5 py-1.5 rounded bg-cyan-600/30 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/30 font-medium"
                >
                  View Page
                </button>
                <button
                  onClick={nextStep}
                  disabled={activeStep === DEMO_STEPS.length}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold disabled:opacity-40"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
