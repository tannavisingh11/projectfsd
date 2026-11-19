export type IncidentCategory =
  | 'FLOOD'
  | 'ROAD_HAZARD'
  | 'FIRE'
  | 'STRUCTURAL_DAMAGE'
  | 'MEDICAL_EMERGENCY'
  | 'UTILITY_OUTAGE'
  | 'SHELTER_REQUEST'
  | 'OTHER';

export type IncidentStatus =
  | 'UNVERIFIED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'RESOLVED'
  | 'FLAGGED_CONFLICT';

export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type UserRole = 'CITIZEN' | 'COORDINATOR' | 'REVIEWER' | 'ADMIN';

export type HelpRequestType =
  | 'FOOD'
  | 'WATER'
  | 'SHELTER'
  | 'MEDICAL'
  | 'EVACUATION'
  | 'POWER'
  | 'OTHER';

export type HelpRequestStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'RESOLVED';

export type ResourceType =
  | 'PERSONNEL'
  | 'VEHICLE'
  | 'SUPPLY'
  | 'EQUIPMENT'
  | 'SHELTER';

export type ResourceStatus = 'AVAILABLE' | 'DEPLOYED' | 'MAINTENANCE' | 'STANDBY';

export type DuplicateStatus =
  | 'PENDING'
  | 'CONFIRMED_DUPLICATE'
  | 'REJECTED'
  | 'CORROBORATING_REPORT';

export interface IncidentAnalysis {
  id: string;
  reportId: string;
  extractedCategory: IncidentCategory;
  extractedNeeds: string; // JSON string array
  extractedLocation: string;
  extractedTimeframe: string | null;
  structuredSummary: string;
  urgencyRationale: string;
  confidenceScore: number;
  modelProvider: string;
  isVerified: boolean;
  createdAt: string;
}

export interface DuplicateSuggestion {
  id: string;
  primaryReportId: string;
  primaryReport?: IncidentReport;
  matchedReportId: string;
  matchedReport?: IncidentReport;
  similarityScore: number;
  distanceMeters: number;
  matchRationale: string;
  status: DuplicateStatus;
  reviewedById?: string | null;
  reviewNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  capacity: number;
  availableCount: number;
  status: ResourceStatus;
  location: string;
  contactPerson?: string | null;
  createdAt: string;
  updatedAt: string;
  assignments?: Assignment[];
}

export interface Assignment {
  id: string;
  helpRequestId?: string | null;
  helpRequest?: HelpRequest | null;
  resourceId: string;
  resource: Resource;
  assignedById?: string | null;
  assignedAt: string;
  status: 'ASSIGNED' | 'EN_ROUTE' | 'ON_SCENE' | 'COMPLETED' | 'CANCELLED';
  notes?: string | null;
  completedAt?: string | null;
}

export interface HelpRequest {
  id: string;
  reportId?: string | null;
  report?: IncidentReport | null;
  requestType: HelpRequestType;
  description: string;
  urgency: UrgencyLevel;
  status: HelpRequestStatus;
  peopleCount: number;
  specialNeeds?: string | null;
  requesterName?: string | null;
  requesterContact?: string | null;
  createdAt: string;
  updatedAt: string;
  assignments?: Assignment[];
}

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  performedByName: string;
  performedByRole: string;
  previousState?: string | null;
  newState?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface IncidentReport {
  id: string;
  title: string;
  rawDescription: string;
  category: IncidentCategory;
  status: IncidentStatus;
  urgency: UrgencyLevel;
  locationName: string;
  latitude: number;
  longitude: number;
  imageUrl?: string | null;
  reporterName?: string | null;
  reporterContact?: string | null; // Masked for public
  reporterConsent: boolean;
  isConflicting: boolean;
  conflictNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string | null;
  analysis?: IncidentAnalysis | null;
  helpRequests?: HelpRequest[];
  primaryDuplicates?: DuplicateSuggestion[];
  matchedDuplicates?: DuplicateSuggestion[];
  auditLogs?: AuditLog[];
}

export interface DashboardStats {
  summary: {
    totalReports: number;
    pendingVerification: number;
    underReview: number;
    verifiedCount: number;
    resolvedCount: number;
    totalRequests: number;
    activeRequests: number;
    totalResources: number;
    deployedUnits: number;
    availableUnits: number;
  };
  categoryDistribution: { category: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
  urgencyDistribution: { urgency: string; count: number }[];
  requestsByStatus: { status: string; count: number }[];
  duplicateStats: { status: string; count: number }[];
  timelineData: { time: string; reports: number }[];
}
