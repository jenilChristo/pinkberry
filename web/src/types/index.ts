// Baby Types
export interface Baby {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  photoUrl?: string;
  familyId: string;
  createdAt: string;
  lastModifiedUtc: string;
}

// Caregiver Types
export interface Caregiver {
  id: string;
  name: string;
  email: string;
  role: 'Parent' | 'Guardian' | 'Babysitter' | 'Other';
  familyId: string;
  photoUrl?: string;
}

// Sleep Types
export interface SleepRecord {
  id: string;
  babyId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  quality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  notes?: string;
  recordedBy: string;
  createdAt: string;
  lastModifiedUtc: string;
}

// Feeding Types
export type FeedingType = 'Breast' | 'Bottle' | 'Solid';
export type BreastSide = 'Left' | 'Right' | 'Both';

export interface Feeding {
  id: string;
  babyId: string;
  feedingTime: string;
  feedingType: FeedingType;
  amountMl?: number;
  durationMinutes?: number;
  breastSide?: BreastSide;
  foodDescription?: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
  lastModifiedUtc: string;
}

// Diaper Types
export type DiaperType = 'Wet' | 'Dirty' | 'Both' | 'Dry';

export interface DiaperChange {
  id: string;
  babyId: string;
  changeTime: string;
  diaperType: DiaperType;
  hasRash: boolean;
  rashSeverity?: 'Mild' | 'Moderate' | 'Severe';
  notes?: string;
  recordedBy: string;
  createdAt: string;
  lastModifiedUtc: string;
}

// Growth Types
export interface GrowthMeasurement {
  id: string;
  babyId: string;
  measurementDate: string;
  weightKg?: number;
  heightCm?: number;
  headCircumferenceCm?: number;
  notes?: string;
  recordedBy: string;
  createdAt: string;
  lastModifiedUtc: string;
}

// Cry Analysis Types
export type CryReason =
  | 'Hungry'
  | 'Tired'
  | 'NeedsDiaperChange'
  | 'Uncomfortable'
  | 'Pain'
  | 'WantsAttention'
  | 'Scared'
  | 'Overstimulated'
  | 'TooHot'
  | 'TooCold'
  | 'Unknown';

export type AnalysisConfidence = 'VeryLow' | 'Low' | 'Medium' | 'High' | 'VeryHigh';

export interface CryAnalysis {
  id: string;
  babyId: string;
  recordedAt: string;
  primaryReason: CryReason;
  secondaryReason?: CryReason;
  confidenceLevel: AnalysisConfidence;
  durationSeconds: number;
  audioIntensityDb: number;
  audioFileUrl?: string;
  notes?: string;
  recordedBy: string;
  wasAccurate?: boolean;
  feedbackNotes?: string;
  createdAt: string;
  lastModifiedUtc: string;
}

export interface CryAnalysisResult {
  primaryReason: CryReason;
  secondaryReason?: CryReason;
  confidenceLevel: AnalysisConfidence;
  audioIntensityDb: number;
  reasonDescription: string;
  suggestedActions: string[];
}

export interface CryPatterns {
  reasonFrequency: Record<string, number>;
  hourlyDistribution: Record<number, number>;
  averageConfidence: number;
  totalAnalyses: number;
  mostCommonReason: string;
}

// Dashboard Types
export interface DashboardSummary {
  lastFeeding?: Feeding;
  lastSleep?: SleepRecord;
  lastDiaperChange?: DiaperChange;
  todayStats: {
    totalFeedings: number;
    totalSleepHours: number;
    totalDiaperChanges: number;
  };
  recentActivities: Activity[];
}

export interface Activity {
  id: string;
  babyId: string;
  activityType: 'Sleep' | 'Feeding' | 'Diaper' | 'Growth' | 'CryAnalysis';
  timestamp: string;
  description: string;
  recordedBy: string;
  recordedByName: string;
}

// API Request/Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  familyId?: string;
}
