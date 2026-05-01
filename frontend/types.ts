export type UserRole = 'tenant' | 'agent' | 'admin';

export type PropertyType = 'Self_contain' | 'One_bedroom' | 'Two_bedroom' | 'Three_bedroom' | 'Detached_duplex';
export type PropertyStatus = 'available' | 'under_offer' | 'rented';
export type ListingMode = 'Rent' | 'Shortlet' | 'Sale';

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  Self_contain: 'Self-contain',
  One_bedroom: '1 Bedroom',
  Two_bedroom: '2 Bedroom',
  Three_bedroom: '3 Bedroom',
  Detached_duplex: 'Detached Duplex',
};

export const ABUJA_DISTRICTS = [
  'Wuse', 'Maitama', 'Gwarimpa', 'Lugbe', 'Kubwa',
  'Asokoro', 'Jabi', 'Apo', 'Dawaki', 'Galadimawa',
  'Lokogoma', 'Guzape', 'Katampe', 'Life Camp', 'Mpape', 'Central Area',
] as const;
export type AbujaDistrict = typeof ABUJA_DISTRICTS[number];

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  phone?: string;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  isKycVerified?: boolean;
  businessName?: string;
  nin?: string;
  driverLicenseUrl?: string;
  cacDocUrl?: string;
  currentAddress?: string;
  ninUrl?: string;
  createdAt?: string;
}

export interface Property {
  id: string;
  title: string;
  description?: string;
  district: string;
  address?: string;
  type: PropertyType;
  lat?: number;
  lng?: number;
  baseRent: number;
  serviceCharge: number;
  cautionFee: number;
  agencyFee?: number;
  legalFee?: number;
  totalInitialPayment?: number;
  images: string[];
  videoUrl: string;
  bedrooms?: number;
  bathrooms?: number;
  sqm?: number;
  furnished: boolean;
  parking: boolean;
  listingMode: ListingMode;
  isFeatured: boolean;
  agentId: string;
  agentName?: string;
  isVerified: boolean;
  verificationStage: string;
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  tenantId: string;
  agentId: string;
  requestedDate: string;
  status: 'pending' | 'accepted' | 'rescheduled' | 'cancelled';
  agentNote?: string;
  propertyTitle?: string;
  tenantName?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  reference: string;
  propertyId: string;
  tenantId: string;
  agentId: string;
  amount: number;
  amountKobo: number;
  description?: string;
  status: 'pending' | 'confirmed' | 'releasing' | 'released' | 'failed' | 'refunded';
  tenantConfirmedMoveIn: boolean;
  moveInConfirmedAt?: string;
  propertyTitle?: string;
  agentName?: string;
  tenantEmail?: string;
  createdAt: string;
}

export interface PropertyFilters {
  search: string;
  district: string;
  type: PropertyType | '';
  minRent: string;
  maxRent: string;
  status: PropertyStatus | '';
}

export const DEFAULT_FILTERS: PropertyFilters = {
  search: '',
  district: '',
  type: '',
  minRent: '',
  maxRent: '',
  status: '',
};
