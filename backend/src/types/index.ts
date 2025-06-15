export interface User {
  _id?: string;
  uid: string; // Firebase UID
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePicture?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  preferences?: {
    notifications: boolean;
    newsletter: boolean;
    theme: 'light' | 'dark';
  };
  memberSince: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export interface Car {
  _id?: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  licensePlate?: string;
  color?: string;
  mileage?: number;
  transmission?: 'automatic' | 'manual';
  fuelType?: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  photos?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Policy {
  _id?: string;
  userId: string;
  carId: string;
  policyNumber: string;
  provider: string;
  type: 'liability' | 'comprehensive' | 'collision' | 'full-coverage';
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  premium: number;
  deductible: number;
  coverage: {
    bodilyInjury: number;
    propertyDamage: number;
    collision?: number;
    comprehensive?: number;
    uninsuredMotorist?: number;
  };
  startDate: Date;
  endDate: Date;
  renewalDate?: Date;
  documents?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumPost {
  _id: string;
  userId: string;
  title: string;
  content: string;
  category: 'general' | 'claims' | 'tips' | 'reviews';
  tags?: string[];
  likes: number;
  replies: number;
  isSticky?: boolean;
  isClosed?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  _id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'policy' | 'renewal' | 'claim' | 'system' | 'forum';
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}
