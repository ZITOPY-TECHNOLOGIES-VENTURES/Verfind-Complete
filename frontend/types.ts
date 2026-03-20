
export type UserRole = 'tenant' | 'agent' | 'admin';

export interface User {
  _id: string;
  username: string;
  email: string;
  password?: string;
  token?: string;
  role: UserRole;
  isKycVerified?: boolean;
  createdAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  data?: T;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: string;
  createdAt: string;
}

export type AbujaDistrict =
  | 'Wuse'
  | 'Maitama'
  | 'Gwarimpa'
  | 'Lugbe'
  | 'Kubwa'
  | 'Bwari'
  | 'Asokoro'
  | 'Jabi'
  | 'Central Area'
  | 'Apo'
  | 'Dawaki'
  | 'Galadimawa'
  | 'Lokogoma'
  | 'Guzape'
  | 'Katampe'
  | 'Life Camp'
  | 'Mpape';

export type VerificationStage =
  | 'listing_created'
  | 'docs_uploaded'
  | 'agent_vetted'
  | 'inspection_scheduled'
  | 'verified';

export interface Property {
  _id: string;
  title: string;
  description: string;
  district: AbujaDistrict;
  address: string;
  type: 'Apartment' | 'House' | 'Duplex' | 'Bungalow';

  // ── NEW: Core specs (like Zillow/Realtor.com) ──
  bedrooms: number;
  bathrooms: number;
  sqm: number;           // square metres
  furnished: boolean;
  parking: boolean;

  // Geolocation
  lat: number;
  lng: number;

  // Financials
  baseRent: number;
  serviceCharge: number;
  cautionFee: number;
  agencyFee: number;
  legalFee: number;
  totalInitialPayment: number;

  // Media & Agent
  images: string[];
  videoUrl: string;
  agentId: string;
  agentName: string;

  // Status
  isVerified: boolean;
  verificationStage: VerificationStage;
  status: 'available' | 'under-offer' | 'rented';
  createdAt: string;

  // Inspection tracking
  lastInspectionRequest?: {
    tenantId: string;
    tenantName: string;
    requestedAt: string;
  };
}

// ── NEW: Search & Filter params ───────────────────────────────────────────────
export interface PropertyFilters {
  search: string;
  district: AbujaDistrict | '';
  type: Property['type'] | '';
  minRent: string;
  maxRent: string;
  bedrooms: string;
  bathrooms: string;
  verified: boolean | null;
  status: Property['status'] | '';
  sortBy: 'createdAt' | 'baseRent' | 'totalInitialPayment';
  sortDir: 'asc' | 'desc';
}

export const DEFAULT_FILTERS: PropertyFilters = {
  search: '',
  district: '',
  type: '',
  minRent: '',
  maxRent: '',
  bedrooms: '',
  bathrooms: '',
  verified: null,
  status: '',
  sortBy: 'createdAt',
  sortDir: 'desc',
};

export enum AppMode {
  BROWSE = 'browse',
  MANAGE_LISTINGS = 'manage_listings',
  INSPECTIONS = 'inspections',
  WALLET = 'wallet',
  CHAT_ASSISTANT = 'chat_assistant',
  FAVORITES = 'favorites',
}

export interface Attachment {
  mimeType: string;
  data: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  isThinking?: boolean;
  generatedImage?: string;
  attachments?: Attachment[];
  groundingSources?: GroundingSource[];
}
