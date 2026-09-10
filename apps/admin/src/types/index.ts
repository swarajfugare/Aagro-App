export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
export type RoleName = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'FARMER' | 'DRIVER' | 'BUYER';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type QuantityUnit = 'KG' | 'QUINTAL' | 'METRIC_TON' | 'TON' | 'LITRE' | 'CRATE' | 'BAG';
export type AreaUnit = 'ACRE' | 'HECTARE' | 'GUNTHA' | 'SQ_METER';
export type SupplyStatus = 'DRAFT' | 'AVAILABLE' | 'PARTIALLY_MATCHED' | 'FULLY_MATCHED' | 'RESERVED' | 'SOLD' | 'EXPIRED' | 'CANCELLED';
export type RequirementStatus = 'DRAFT' | 'OPEN' | 'MATCHING' | 'PARTIALLY_MATCHED' | 'FULLY_MATCHED' | 'ORDERED' | 'FULFILLED' | 'EXPIRED' | 'CANCELLED';
export type OrderStatus =
  | 'CREATED'
  | 'DRAFT'
  | 'SUBMITTED'
  | 'MATCHING'
  | 'MATCHED'
  | 'CONFIRMED'
  | 'ASSIGNED_TO_TRIP'
  | 'DRIVER_ASSIGNED'
  | 'PICKUP_SCHEDULED'
  | 'PICKUP_IN_PROGRESS'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'ARRIVED_AT_HUB'
  | 'SORTED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERY_ATTEMPTED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'FAILED'
  | 'REJECTED';
export type DriverStatus = 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE' | 'SUSPENDED';
export type TripStatus = 'DRAFT' | 'PLANNED' | 'ASSIGNED' | 'DRIVER_ASSIGNED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface UserProfile {
  id: string;
  firebaseUid: string;
  email: string | null;
  phone: string | null;
  fullName: string;
  avatarUrl: string | null;
  status: UserStatus;
  role: RoleName;
  permissions: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: {
    code?: string;
    details?: any;
  };
}

export interface DashboardStats {
  farmersCount?: number;
  buyersCount?: number;
  driversCount?: number;
  activeSupplyBatchesCount?: number;
  openDemandCount?: number;
  totalOrdersCount?: number;
  totalRevenue?: number;
  metrics?: {
    totalFarmers: number;
    verifiedFarmers: number;
    pendingFarmers: number;
    totalBuyers: number;
    verifiedBuyers: number;
    totalDrivers: number;
    activeDrivers: number;
    totalCrops: number;
    availableSupplyBatches: number;
    openDemands: number;
    activeOrders: number;
    completedOrders: number;
    activeTrips: number;
  };
  supplyVsDemand?: {
    period?: string;
    crop?: string;
    category?: string;
    supply?: number;
    demand?: number;
    supplyCount?: number;
    demandCount?: number;
  }[];
  cropDistribution?: {
    cropName?: string;
    name?: string;
    count?: number;
    value?: number;
  }[];
  recentOrders?: any[];
  recentActivity?: any[];
  alerts?: {
    id: string;
    type: 'info' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: string;
  }[];
}

export interface Farmer {
  id: string;
  userId?: string;
  villageId?: string | null;
  village?: string | null;
  district?: string | null;
  state?: string | null;
  landSizeAcres?: number | string | null;
  experienceYears?: number | null;
  aadharNumber?: string | null;
  status: VerificationStatus | string;
  kycStatus?: VerificationStatus;
  kycDocumentNumber?: string | null;
  idProofType?: string | null;
  address?: string | null;
  verificationNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id?: string;
    name?: string;
    fullName?: string;
    email?: string | null;
    phone?: string | null;
    status?: UserStatus;
    avatarUrl?: string | null;
  };
  farms?: Array<{
    id: string;
    name: string;
    areaAcres: number | string;
    village?: string;
    district?: string;
    state?: string;
    soilType?: string;
    irrigationSource?: string;
    latitude?: number;
    longitude?: number;
  }>;
  farmerCrops?: any[];
  supplyBatches?: any[];
  farmerDocuments?: any[];
  _count?: {
    farms: number;
    farmerCrops: number;
    supplyBatches: number;
  };
}

export interface Buyer {
  id: string;
  userId?: string;
  businessName?: string;
  companyName?: string | null;
  businessType?: string | null;
  gstNumber?: string | null;
  panNumber?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  status: VerificationStatus | string;
  verificationStatus?: VerificationStatus;
  verificationNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id?: string;
    name?: string;
    fullName?: string;
    email?: string | null;
    phone?: string | null;
    status?: UserStatus;
    avatarUrl?: string | null;
  };
  demands?: BuyerDemand[];
  requirements?: any[];
  orders?: Order[];
  _count?: {
    requirements?: number;
    orders?: number;
  };
}

export interface Driver {
  id: string;
  userId?: string;
  licenseNumber: string;
  licenseType?: string;
  status: VerificationStatus | string;
  verificationStatus?: VerificationStatus;
  isAvailable?: boolean;
  experienceYears?: number | null;
  aadharNumber?: string | null;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  lastLocationUpdate?: string | null;
  verificationNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id?: string;
    name?: string;
    fullName?: string;
    email?: string | null;
    phone?: string | null;
    status?: UserStatus;
  };
  vehicles?: Array<{
    id: string;
    registrationNumber: string;
    type: string;
    model?: string;
    capacityKg: number | string;
    hasRefrigeration?: boolean;
  }>;
  trips?: Trip[];
  driverDocuments?: any[];
  _count?: {
    trips: number;
    vehicles: number;
  };
}

export interface CropVariety {
  id: string;
  cropId?: string;
  name: string;
  localName?: string | null;
  season?: string | null;
  maturityDays?: number | null;
  expectedYieldPerAcre?: number | null;
}

export interface Crop {
  id: string;
  name: string;
  scientificName?: string | null;
  category: string;
  defaultUnit?: string;
  shelfLifeDays?: number | null;
  idealStorageTempMin?: number | null;
  idealStorageTempMax?: number | null;
  description?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  varieties?: CropVariety[];
  _count?: {
    supplyBatches?: number;
    buyerRequirements?: number;
    farmerCrops?: number;
  };
}

export interface SupplyBatch {
  id: string;
  farmerId: string;
  batchNumber?: string;
  cropId: string;
  quantity: number | string;
  availableQuantity?: number | string;
  remainingQuantity?: number | string;
  unit: QuantityUnit | string;
  grade?: string;
  qualityGrade?: string;
  basePricePerUnit: number;
  currency?: string;
  harvestDate?: string;
  expiryDate?: string;
  availableFrom?: string;
  availableUntil?: string | null;
  status: SupplyStatus | string;
  notes?: string | null;
  photoUrl?: string | null;
  createdAt: string;
  farmer?: {
    id?: string;
    village?: string;
    district?: string;
    state?: string;
    user?: { name?: string; fullName?: string; phone?: string | null };
  };
  crop?: { name: string; category: string };
  variety?: { name: string } | null;
}

export interface BuyerDemand {
  id: string;
  buyerId: string;
  cropId: string;
  targetQuantity: number | string;
  unit: QuantityUnit | string;
  maxPricePerUnit?: number | null;
  qualityGradeMin?: string;
  requiredByDate?: string;
  status: RequirementStatus | string;
  notes?: string | null;
  createdAt: string;
  buyer?: {
    businessName?: string;
    city?: string;
    state?: string;
    address?: string;
    pincode?: string;
    gstNumber?: string;
    user?: { name?: string; phone?: string; email?: string };
  };
  crop?: { name: string; category?: string };
  variety?: { name: string } | null;
}

export interface OrderItem {
  id: string;
  orderId?: string;
  cropId?: string;
  supplyBatchId?: string | null;
  quantity: number;
  unit?: string;
  pricePerUnit: number;
  totalPrice?: number;
  crop?: { name: string };
  supplyBatch?: { crop?: { name: string } };
  farmer?: { user?: { fullName?: string; name?: string } };
}

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  totalQuantity?: number | string;
  totalAmount: number;
  currency?: string;
  deliveryAddress?: string;
  status: OrderStatus | string;
  notes?: string | null;
  confirmedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  buyer?: {
    businessName?: string;
    companyName?: string | null;
    city?: string;
    state?: string;
    address?: string;
    user?: { name?: string; fullName?: string; phone?: string | null };
  };
  items?: OrderItem[];
  orderItems?: OrderItem[];
  statusHistory?: {
    id: string;
    fromStatus: OrderStatus | null;
    toStatus: OrderStatus;
    reason: string | null;
    createdAt: string;
  }[];
}

export interface TripStop {
  id: string;
  tripId?: string;
  sequence?: number;
  stopOrder?: number;
  type: string;
  stopType?: string;
  status: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  estimatedArrival?: string | null;
  completedAt?: string | null;
}

export interface Trip {
  id: string;
  tripNumber: string;
  driverId?: string;
  vehicleId?: string;
  orderId?: string | null;
  totalDistanceKm?: number | string | null;
  estimatedDurationMinutes?: number | null;
  totalPlannedLoad?: number | string;
  loadUnit?: QuantityUnit | string;
  status: TripStatus | string;
  startTime?: string | null;
  endTime?: string | null;
  createdAt: string;
  driver?: {
    id?: string;
    user?: { name?: string; fullName?: string; phone?: string | null };
  };
  vehicle?: {
    registrationNumber?: string;
    vehicleNumber?: string;
    type?: string;
    vehicleType?: string;
    capacityKg?: number | string;
    capacity?: number | string;
    capacityUnit?: QuantityUnit | string;
  };
  stops?: TripStop[];
  tripStops?: TripStop[];
  order?: {
    orderNumber: string;
    buyer: { user: { fullName: string } };
  } | null;
  _count?: {
    tripStops?: number;
    stops?: number;
  };
}
