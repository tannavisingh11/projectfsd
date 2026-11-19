import React, { useState } from 'react';
import { api } from '../utils/api';
import { IncidentCategory, UrgencyLevel } from '../types';
import { MapView } from '../components/MapView';
import {
  FilePlus2,
  Sparkles,
  MapPin,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  UploadCloud,
  CheckCircle2,
  Send,
  Zap,
} from 'lucide-react';

export const SubmitReportPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [title, setTitle] = useState('');
  const [rawDescription, setRawDescription] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('OTHER');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState<number>(37.7749);
  const [longitude, setLongitude] = useState<number>(-122.4194);
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [reporterConsent, setReporterConsent] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiPreview, setAiPreview] = useState<any | null>(null);
  const [successReport, setSuccessReport] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Preset Scenarios for Hackathon Demonstrations
  const applyPreset = (presetType: 'flood1' | 'flood2' | 'wire') => {
    if (presetType === 'flood1') {
      setTitle('Severe Flash Flooding at Maple Ave & 5th St Underpass');
      setRawDescription(
        'Severe water accumulation under the railroad underpass at Maple Ave and 5th St. Water is rising fast, estimated 3-4 feet deep. Two passenger vehicles are stranded with water up to window level; drivers are waving from roof.'
      );
      setCategory('FLOOD');
      setLocationName('Maple Ave & 5th St Underpass, Riverdale District');
      setLatitude(37.7749);
      setLongitude(-122.4194);
      setReporterName('David Miller');
      setReporterContact('+1 (555) 019-5567');
    } else if (presetType === 'flood2') {
      setTitle('Dangerous deep water under train bridge 5th & Maple');
      setRawDescription(
        'Do not come down Maple near 5th! The underpass is completely flooded under the train bridge. Saw two cars trapped in the deep water, looks like people are waiting for help on top of a sedan.'
      );
      setCategory('FLOOD');
      setLocationName('5th St & Maple Ave Railroad Crossing');
      setLatitude(37.7753);
      setLongitude(-122.4188);
      setReporterName('Anonymous Citizen');
    } else if (presetType === 'wire') {
      setTitle('Downed Live Electrical Lines on Oak Ridge Rd');
      setRawDescription(
        'Severe wind gust brought down an electrical transformer pole. Live wires are arcing violently across Oak Ridge Rd between Crestview and Pine. Small brush fire starting near curb.'
      );
      setCategory('UTILITY_OUTAGE');
      setLocationName('Oak Ridge Rd & Crestview Lane');
      setLatitude(37.7833);
      setLongitude(-122.4167);
      setReporterName('Oak Ridge Neighborhood Watch');
    }
  };

  // Run Real-Time AI Interpretation Preview
  const handleRunAiPreview = async () => {
    if (!rawDescription.trim() || rawDescription.length < 10) {
      alert('Please enter at least 10 characters in the description first.');
      return;
    }
    try {
      setIsAnalyzing(true);
      setErrorMessage(null);
      const res = await api.interpretText({
        text: rawDescription,
        location: locationName,
        category,
      });
      setAiPreview(res.analysis);
      if (res.analysis.extractedCategory) {
        setCategory(res.analysis.extractedCategory);
      }
    } catch (err: any) {
      setErrorMessage(`AI Interpretation failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporterConsent) {
      alert('You must provide consent for emergency dispatch processing.');
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const payload = {
        title: title || rawDescription.substring(0, 60),
        rawDescription,
        category,
        locationName: locationName || 'Pinned on map',
        latitude,
        longitude,
        reporterName,
        reporterContact,
        reporterConsent,
      };

      const res = await api.createReport(payload);
      setSuccessReport(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Submit Emergency Report</h1>
          <p className="text-xs text-slate-400 mt-1">
            Community incident submission portal powered by AI structured extraction.
          </p>
        </div>

        {/* Preset Fill Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium">Demo Presets:</span>
          <button
            type="button"
            onClick={() => applyPreset('flood1')}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 transition-colors"
          >
            Flood #1 (Maple)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('flood2')}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900 transition-colors"
          >
            Flood #2 (Candidate Dup)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('wire')}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-yellow-950 text-yellow-300 border border-yellow-800 hover:bg-yellow-900 transition-colors"
          >
            Live Wire Hazard
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-500 text-xs text-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success Modal / Banner */}
      {successReport && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-navy-900 to-navy-950 border border-emerald-500/50 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            Report Successfully Ingested & Parsed!
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Report <strong>"{successReport.report.title}"</strong> has been indexed into the central emergency network.
            Extracted category: <strong className="text-cyan-400">{successReport.report.category}</strong>.
            Status: <strong className="text-amber-400">UNVERIFIED</strong> (queued for human triage).
          </p>

          {successReport.detectedDuplicates && successReport.detectedDuplicates.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-600/50 text-xs text-amber-200">
              <strong className="block mb-1 text-amber-300">
                🚨 Duplicate Engine Alert: Possible duplicate match detected!
              </strong>
              <p>{successReport.detectedDuplicates[0].matchRationale}</p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Go to Live Dashboard
            </button>
            <button
              onClick={() => {
                setSuccessReport(null);
                setTitle('');
                setRawDescription('');
                setAiPreview(null);
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      )}

      {/* Main Submission Form & AI Extraction Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column (Left) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-5">
          {/* Natural Language Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                1. What happened? (Natural Language) *
              </label>
              <button
                type="button"
                onClick={handleRunAiPreview}
                disabled={isAnalyzing || rawDescription.length < 10}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 disabled:opacity-40"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {isAnalyzing ? 'Analyzing...' : 'Preview AI Extraction'}
              </button>
            </div>
            <textarea
              required
              rows={4}
              value={rawDescription}
              onChange={(e) => setRawDescription(e.target.value)}
              placeholder="Describe what you see in plain words: e.g. Flash flood under railroad bridge at Maple & 5th. Water rising quickly, two cars submerged, drivers trapped on roof waving for help..."
              className="w-full bg-navy-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 leading-relaxed"
            />
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Short Incident Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Flash Flooding at Maple Ave Underpass"
                className="w-full bg-navy-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Category (or auto-detect via AI)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                className="w-full bg-navy-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="FLOOD">Flood</option>
                <option value="ROAD_HAZARD">Road Hazard</option>
                <option value="FIRE">Fire</option>
                <option value="UTILITY_OUTAGE">Utility Outage</option>
                <option value="SHELTER_REQUEST">Shelter / Basic Needs</option>
                <option value="MEDICAL_EMERGENCY">Medical Emergency</option>
                <option value="STRUCTURAL_DAMAGE">Structural Damage</option>
                <option value="OTHER">Other / Uncategorized</option>
              </select>
            </div>
          </div>

          {/* Location & Interactive Map Pinning */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
              2. Approximate Location *
            </label>
            <input
              type="text"
              required
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Maple Ave & 5th St Underpass, Riverdale District"
              className="w-full bg-navy-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />

            <div className="rounded-xl overflow-hidden border border-slate-800">
              <MapView
                isPickerMode={true}
                pickedLocation={{ lat: latitude, lng: longitude }}
                onPickLocation={(coords) => {
                  setLatitude(coords.lat);
                  setLongitude(coords.lng);
                }}
                height="220px"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Latitude: {latitude.toFixed(5)}</span>
              <span>Longitude: {longitude.toFixed(5)}</span>
            </div>
          </div>

          {/* Reporter Details (Protected by Privacy Shield) */}
          <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Reporter Identification (Private & Protected)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="Your Name (Optional)"
                className="bg-navy-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <input
                type="text"
                value={reporterContact}
                onChange={(e) => setReporterContact(e.target.value)}
                placeholder="Phone or Email (Responders only)"
                className="bg-navy-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* Consent Notice */}
            <label className="flex items-start gap-2.5 pt-1 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={reporterConsent}
                onChange={(e) => setReporterConsent(e.target.checked)}
                className="mt-0.5 rounded bg-navy-950 border-slate-700 text-cyan-500 focus:ring-0"
              />
              <span>
                I consent to submitting this emergency information for civic triage.
                My contact details will <strong>never</strong> be published on the open map and are restricted to verified responders.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !reporterConsent}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-950 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Processing AI Triage...' : 'Submit Incident Report to Network'}
          </button>
        </form>

        {/* AI Live Structured Extraction Panel (Right) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-b from-navy-900 to-navy-850 border border-cyan-500/30 shadow-xl space-y-4 sticky top-24">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Live AI Extraction Preview
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Decision Support
              </span>
            </div>

            {aiPreview ? (
              <div className="space-y-4 text-xs">
                {/* Structured Summary */}
                <div className="p-3 rounded-lg bg-navy-950/80 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Generated Summary:</span>
                  <p className="text-white font-medium leading-relaxed">{aiPreview.structuredSummary}</p>
                </div>

                {/* Urgency Rationale */}
                <div className="p-3 rounded-lg bg-navy-950/80 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Urgency Rationale:</span>
                  <p className="text-amber-300 leading-relaxed">{aiPreview.urgencyRationale}</p>
                </div>

                {/* Needs Extracted */}
                <div>
                  <span className="text-slate-400 block mb-1.5 font-semibold">Identified Needs:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {aiPreview.extractedNeeds?.map((need: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-[11px]"
                      >
                        #{need}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Confidence Meter */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Extraction Confidence:</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {Math.round((aiPreview.confidenceScore || 0.9) * 100)}%
                  </span>
                </div>

                <div className="text-[11px] text-amber-400/90 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  Marked UNVERIFIED until reviewed by triage personnel.
                </div>
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-2 text-slate-500">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">
                  Type your incident description on the left and click <strong>"Preview AI Extraction"</strong> or select a demo preset.
                </p>
                <span className="text-[10px] text-slate-600 block">
                  ResQNet extracts entities, coordinates, and needs without hallucinating missing data.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
