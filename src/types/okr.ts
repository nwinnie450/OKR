// User and Team Types
export type UserRole = 'admin' | 'manager' | 'team_lead' | 'member' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  teamId?: string;
  teams?: string[];
  departments?: string[];
  avatar?: string;
  avatarUrl?: string;
  createdAt: string | Date;
  updatedAt?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  managerId: string;
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
}

// OKR Types
export type ObjectiveType = 'company' | 'team' | 'individual';
export type TimePeriod = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'H1' | 'H2' | 'Annual';
export type ObjectiveStatus = 'draft' | 'active' | 'completed' | 'archived';

export interface Objective {
  id: string;
  title: string;
  description: string;
  type: ObjectiveType;
  ownerId: string;
  teamId?: string;
  timePeriod: TimePeriod;
  year: number;
  status: ObjectiveStatus;
  category?: string;
  tags?: string[];
  alignedToId?: string; // Parent objective ID
  progress: number; // 0-100
  confidence: ConfidenceLevel;
  keyResultIds: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// Key Result Types
export type MetricType = 'number' | 'percentage' | 'currency' | 'boolean';
export type ConfidenceLevel = 'on-track' | 'at-risk' | 'off-track';

export interface KeyResult {
  id: string;
  objectiveId: string;
  title: string;
  description?: string;
  ownerId: string;
  metricType: MetricType;
  unit?: string; // e.g., "users", "USD", "%"
  startingValue: number;
  targetValue: number;
  currentValue: number;
  progress: number; // 0-100, auto-calculated
  confidence: ConfidenceLevel;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  lastCheckinAt?: string;
}

// Check-in Types
export interface CheckIn {
  id: string;
  keyResultId: string;
  userId: string;
  currentValue: number;
  progress: number;
  confidence: ConfidenceLevel;
  statusComment?: string;
  blockers?: string;
  completedTaskIds?: string[];
  isLate: boolean;
  submittedAt: string;
  createdAt: string;
}

// Task Types
export interface Task {
  id: string;
  externalId?: string; // For Jira/external systems
  title: string;
  keyResultId: string;
  isCompleted: boolean;
  completedAt?: string;
  weight?: number;
  createdAt: string;
  updatedAt: string;
}

// Dashboard Types
export interface CompanyOverview {
  totalObjectives: {
    company: number;
    team: number;
    individual: number;
  };
  overallScore: number;
  statusBreakdown: {
    onTrack: number;
    atRisk: number;
    offTrack: number;
  };
  quarterlyTrend: TrendDataPoint[];
}

export interface TrendDataPoint {
  week: number;
  date: string;
  averageProgress: number;
}

export interface TeamPerformance {
  teamId: string;
  teamName: string;
  objectiveCount: number;
  averageProgress: number;
  status: ConfidenceLevel;
  lastUpdated: string;
}

export interface AtRiskAlert {
  id: string;
  type: 'objective' | 'keyResult';
  itemId: string;
  title: string;
  ownerId: string;
  ownerName: string;
  teamId?: string;
  teamName?: string;
  status: ConfidenceLevel;
  progress: number;
  daysOverdue?: number;
  lastCheckin?: string;
}

export interface ActivityFeedItem {
  id: string;
  type: 'checkin' | 'comment' | 'blocker' | 'created' | 'updated';
  userId: string;
  userName: string;
  itemType: 'objective' | 'keyResult';
  itemId: string;
  itemTitle: string;
  content?: string;
  timestamp: string;
}

// Filter Types
export interface DashboardFilters {
  timePeriod?: TimePeriod;
  year?: number;
  teamId?: string;
  status?: ConfidenceLevel | 'all';
  ownerId?: string;
}

// Form Types
export interface CreateObjectiveForm {
  title: string;
  description: string;
  type: ObjectiveType;
  ownerId: string;
  teamId?: string;
  timePeriod: TimePeriod;
  year: number;
  category?: string;
  tags?: string[];
  alignedToId?: string;
}

export interface CreateKeyResultForm {
  objectiveId: string;
  title: string;
  description?: string;
  ownerId: string;
  metricType: MetricType;
  unit?: string;
  startingValue: number;
  targetValue: number;
  dueDate?: string;
}

export interface CheckInForm {
  keyResultId: string;
  currentValue: number;
  confidence: ConfidenceLevel;
  statusComment?: string;
  blockers?: string;
  completedTaskIds?: string[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
