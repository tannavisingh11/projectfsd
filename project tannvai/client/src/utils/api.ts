import { UserRole } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

let currentRole: UserRole = 'CITIZEN';
let currentUserId = 'simulated-user-id';
let currentUserName = 'Community Member';

export function setApiUserContext(role: UserRole, userId?: string, name?: string) {
  currentRole = role;
  if (userId) currentUserId = userId;
  if (name) currentUserName = name;
}

export function getApiUserContext(): { role: UserRole; userId: string; name: string } {
  return { role: currentRole, userId: currentUserId, name: currentUserName };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'x-user-role': currentRole,
    'x-user-id': currentUserId,
    'x-user-name': currentUserName,
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    let errorMsg = `HTTP Error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorData.message || errorMsg;
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Reports
  getReports: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return request<{ reports: any[] }>(`/reports${qs}`);
  },
  getReport: (id: string) => request<{ report: any }>(`/reports/${id}`),
  createReport: (data: any) => request<any>('/reports', { method: 'POST', body: JSON.stringify(data) }),
  updateReportStatus: (id: string, data: { status: string; notes?: string; isConflicting?: boolean; conflictNotes?: string }) =>
    request<any>(`/reports/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),

  // AI Interpretation Preview
  interpretText: (data: { text: string; location?: string; category?: string }) =>
    request<any>('/analysis/interpret', { method: 'POST', body: JSON.stringify(data) }),

  // Duplicates
  getDuplicates: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return request<{ suggestions: any[] }>(`/duplicates${qs}`);
  },
  reviewDuplicate: (id: string, data: { status: string; reviewNotes: string }) =>
    request<any>(`/duplicates/${id}/review`, { method: 'POST', body: JSON.stringify(data) }),

  // Resources
  getResources: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return request<{ resources: any[] }>(`/resources${qs}`);
  },
  createResource: (data: any) => request<any>('/resources', { method: 'POST', body: JSON.stringify(data) }),
  updateResource: (id: string, data: any) => request<any>(`/resources/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Help Requests & Assignments
  getHelpRequests: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return request<{ requests: any[] }>(`/requests${qs}`);
  },
  createHelpRequest: (data: any) => request<any>('/requests', { method: 'POST', body: JSON.stringify(data) }),
  updateRequestStatus: (id: string, data: { status: string; notes?: string }) =>
    request<any>(`/requests/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  assignResourceToRequest: (requestId: string, data: { resourceId: string; notes?: string }) =>
    request<any>(`/requests/${requestId}/assign`, { method: 'POST', body: JSON.stringify(data) }),
  updateAssignmentStatus: (assignmentId: string, data: { status: string; notes?: string }) =>
    request<any>(`/requests/assignments/${assignmentId}/status`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Stats & Audit
  getStats: () => request<any>('/stats'),
  getAuditLogs: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return request<{ logs: any[] }>(`/audit${qs}`);
  },

  // Demo Control
  resetDemo: () => request<any>('/demo/reset', { method: 'POST' }),
  loadDemoScenario: () => request<any>('/demo/load-scenario', { method: 'POST' }),
};
