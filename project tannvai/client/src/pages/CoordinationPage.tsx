import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { HelpRequest, Resource, Assignment } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Users2,
  Truck,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Navigation,
  CheckCheck,
  RefreshCw,
  Droplet,
  Utensils,
  Home,
  HeartPulse,
  Zap,
} from 'lucide-react';

export const CoordinationPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { canAssign, role } = useAuth();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Assignment Modal State
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');
  const [dispatchNotes, setDispatchNotes] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  // New Help Request Modal State
  const [showNewRequestModal, setShowNewRequestModal] = useState<boolean>(false);
  const [newRequestType, setNewRequestType] = useState<string>('WATER');
  const [newRequestDesc, setNewRequestDesc] = useState<string>('');
  const [newRequestCount, setNewRequestCount] = useState<number>(4);
  const [newRequestUrgency, setNewRequestUrgency] = useState<string>('HIGH');
  const [newRequesterName, setNewRequesterName] = useState<string>('');
  const [newRequesterContact, setNewRequesterContact] = useState<string>('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [reqRes, resRes] = await Promise.all([api.getHelpRequests(), api.getResources()]);
      setRequests(reqRes.requests);
      setResources(resRes.resources);
      if (resRes.resources.length > 0) {
        setSelectedResourceId(resRes.resources[0].id);
      }
    } catch (err) {
      console.error('Error fetching coordination data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateHelpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createHelpRequest({
        requestType: newRequestType,
        description: newRequestDesc,
        peopleCount: Number(newRequestCount),
        urgency: newRequestUrgency,
        requesterName: newRequesterName,
        requesterContact: newRequesterContact,
      });
      setShowNewRequestModal(false);
      setNewRequestDesc('');
      fetchData();
    } catch (err: any) {
      alert(`Failed to submit request: ${err.message}`);
    }
  };

  const handleAssignResource = async () => {
    if (!selectedRequest || !selectedResourceId) return;
    try {
      setIsAssigning(true);
      await api.assignResourceToRequest(selectedRequest.id, {
        resourceId: selectedResourceId,
        notes: dispatchNotes || 'Immediate dispatch by coordinator',
      });
      setSelectedRequest(null);
      setDispatchNotes('');
      fetchData();
    } catch (err: any) {
      alert(`Assignment failed: ${err.message}`);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUpdateAssignmentStatus = async (assignmentId: string, newStatus: string) => {
    try {
      await api.updateAssignmentStatus(assignmentId, { status: newStatus });
      fetchData();
    } catch (err: any) {
      alert(`Failed to update assignment status: ${err.message}`);
    }
  };

  const getRequestIcon = (type: string) => {
    switch (type) {
      case 'WATER':
        return <Droplet className="w-4 h-4 text-cyan-400" />;
      case 'FOOD':
        return <Utensils className="w-4 h-4 text-amber-400" />;
      case 'SHELTER':
        return <Home className="w-4 h-4 text-emerald-400" />;
      case 'MEDICAL':
        return <HeartPulse className="w-4 h-4 text-rose-400" />;
      case 'POWER':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      default:
        return <Users2 className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Community Help Coordination</h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch relief resources, deploy specialized squads, and track resolution lifecycles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 rounded-lg bg-navy-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <button
            onClick={() => setShowNewRequestModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow"
          >
            <PlusCircle className="w-4 h-4" />
            Submit Help Request
          </button>
        </div>
      </div>

      {/* Resource Inventory Ribbon */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Relief Fleet & Available Assets ({resources.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {resources.map((res) => {
            const isDeployed = res.status === 'DEPLOYED';
            return (
              <div
                key={res.id}
                className={`p-4 rounded-xl border transition-all ${
                  isDeployed
                    ? 'bg-amber-950/20 border-amber-600/40 text-amber-100'
                    : 'bg-navy-900 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {res.type}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isDeployed ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {res.status}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white line-clamp-1">{res.name}</h3>
                <div className="text-[11px] text-slate-400 mt-1">Location: {res.location}</div>
                <div className="text-[11px] text-cyan-400 mt-1 font-mono">
                  Capacity: {res.availableCount} / {res.capacity} units ready
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Help Requests Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Active Community Help Requests ({requests.length})
          </h2>
          <span className="text-[11px] text-slate-500">
            Authorized Coordinators can dispatch resources to any pending request
          </span>
        </div>

        <div className="space-y-3">
          {requests.map((req) => {
            const hasAssignment = req.assignments && req.assignments.length > 0;
            const latestAssignment = hasAssignment ? req.assignments![0] : null;

            return (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-navy-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {getRequestIcon(req.requestType)}
                      {req.requestType}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-slate-800 text-slate-300">
                      {req.peopleCount} {req.peopleCount === 1 ? 'person' : 'people'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        req.status === 'RESOLVED'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : req.status === 'ASSIGNED'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-medium">{req.description}</p>

                  {req.specialNeeds && (
                    <div className="text-[11px] text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                      Special notes: {req.specialNeeds}
                    </div>
                  )}

                  {/* Privacy protected requester info */}
                  <div className="text-[10px] text-slate-500">
                    Requester: {req.requesterName || 'Anonymous'} &bull; Contact:{' '}
                    <span className="text-slate-400 font-mono">
                      {req.requesterContact || '[Confidential - Responder Access Only]'}
                    </span>
                  </div>
                </div>

                {/* Right Action / Assignment Status */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                  {latestAssignment ? (
                    <div className="p-3 rounded-xl bg-navy-950 border border-blue-500/30 text-xs space-y-1 min-w-[220px]">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-cyan-400 font-semibold">{latestAssignment.resource.name}</span>
                        <span className="text-blue-400 font-mono font-bold">{latestAssignment.status}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {latestAssignment.notes || 'En route to scene'}
                      </p>

                      {/* Transition Buttons */}
                      {canAssign && latestAssignment.status !== 'COMPLETED' && (
                        <div className="flex items-center gap-1 pt-1 border-t border-slate-800">
                          {latestAssignment.status === 'ASSIGNED' && (
                            <button
                              onClick={() => handleUpdateAssignmentStatus(latestAssignment.id, 'EN_ROUTE')}
                              className="px-2 py-0.5 rounded text-[10px] bg-blue-600 hover:bg-blue-500 text-white font-medium"
                            >
                              Mark En Route
                            </button>
                          )}
                          {latestAssignment.status === 'EN_ROUTE' && (
                            <button
                              onClick={() => handleUpdateAssignmentStatus(latestAssignment.id, 'ON_SCENE')}
                              className="px-2 py-0.5 rounded text-[10px] bg-amber-600 hover:bg-amber-500 text-white font-medium"
                            >
                              Mark On Scene
                            </button>
                          )}
                          {latestAssignment.status === 'ON_SCENE' && (
                            <button
                              onClick={() => handleUpdateAssignmentStatus(latestAssignment.id, 'COMPLETED')}
                              className="px-2 py-0.5 rounded text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1"
                            >
                              <CheckCheck className="w-3 h-3" /> Mark Resolved
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    canAssign && (
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow flex items-center gap-1.5 transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        Assign Resource
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Assign Resource Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-2xl bg-navy-900 border border-slate-700 shadow-2xl space-y-4 text-white">
            <h3 className="text-base font-bold">Dispatch Resource to Help Request</h3>
            <p className="text-xs text-slate-300">
              Request: <strong>{selectedRequest.description}</strong> ({selectedRequest.peopleCount} people)
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Select Relief Resource:</label>
              <select
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
                className="w-full bg-navy-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.type} &bull; {r.availableCount} available)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Dispatch Notes / ETA:</label>
              <input
                type="text"
                value={dispatchNotes}
                onChange={(e) => setDispatchNotes(e.target.value)}
                placeholder="e.g. Squad dispatched with Zodiac boat. ETA 6 mins."
                className="w-full bg-navy-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignResource}
                disabled={isAssigning}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                {isAssigning ? 'Dispatching...' : 'Confirm Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Help Request Modal */}
      {showNewRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <form
            onSubmit={handleCreateHelpRequest}
            className="w-full max-w-lg p-6 rounded-2xl bg-navy-900 border border-slate-700 shadow-2xl space-y-4 text-white"
          >
            <h3 className="text-base font-bold">Submit Community Need / Help Request</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Request Type</label>
                <select
                  value={newRequestType}
                  onChange={(e) => setNewRequestType(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="WATER">Drinking Water</option>
                  <option value="FOOD">Food & Meals</option>
                  <option value="SHELTER">Shelter & Warmth</option>
                  <option value="EVACUATION">Evacuation / Extraction</option>
                  <option value="MEDICAL">Medical First Aid</option>
                  <option value="POWER">Power / Generator</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Number of People</label>
                <input
                  type="number"
                  min={1}
                  value={newRequestCount}
                  onChange={(e) => setNewRequestCount(Number(e.target.value))}
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Details & Location</label>
              <textarea
                required
                rows={3}
                value={newRequestDesc}
                onChange={(e) => setNewRequestDesc(e.target.value)}
                placeholder="Describe exact needs: e.g. 45 seniors at Elm facility without drinking water..."
                className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={newRequesterName}
                onChange={(e) => setNewRequesterName(e.target.value)}
                placeholder="Contact Name (Optional)"
                className="bg-navy-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                value={newRequesterContact}
                onChange={(e) => setNewRequesterContact(e.target.value)}
                placeholder="Phone (Responders only)"
                className="bg-navy-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewRequestModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
