import { z } from 'zod';

// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Types for dashboard data
export interface DashboardStats {
  totalCars: number;
  activePolicies: number;
  expiringPolicies: number;
  totalCoverage: string;
}

export interface CarData {
  id: string;
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  fuelType: 'Petrol' | 'Diesel' | 'CNG' | 'Electric';
  variant: string;
  mileage: number;
  location: string;
  policyStatus: 'Active' | 'Expired' | 'Expiring Soon';
  policyExpiryDate: string;
  idv: string;
  imageUrl?: string;
  lastUpdated: string;
}

export interface PolicyData {
  id: string;
  policyNumber: string;
  vehicleDetails: {
    make: string;
    model: string;
    registrationNumber: string;
    year: number;
  };
  insurer: {
    name: string;
    logo: string;
    contactPhone: string;
    contactEmail: string;
  };
  policyType: 'Comprehensive' | 'Third Party' | 'Own Damage';
  status: 'Active' | 'Expired' | 'Expiring Soon' | 'Claimed';
  startDate: string;
  endDate: string;
  premium: {
    annual: number;
    paid: number;
    pending: number;
  };
  idv: number;
  coverage: {
    ownDamage: number;
    thirdParty: number;
    personalAccident: number;
  };
  addOns: string[];
  claims: {
    total: number;
    settled: number;
    pending: number;
  };
  documents: {
    policyDocument: string;
    receiptCopy: string;
  };
  renewalDate: string;
  lastUpdated: string;
}

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Get token from localStorage (you might want to use a more secure method)
  const token = localStorage.getItem('authToken');
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Dashboard API functions
export const dashboardApi = {
  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    return apiRequest<DashboardStats>('/auth/dashboard');
  },

  // Car management
  async getCars(): Promise<CarData[]> {
    return apiRequest<CarData[]>('/cars');
  },

  async addCar(carData: Omit<CarData, 'id' | 'lastUpdated'>): Promise<CarData> {
    return apiRequest<CarData>('/cars', {
      method: 'POST',
      body: JSON.stringify(carData),
    });
  },

  async updateCar(id: string, carData: Partial<CarData>): Promise<CarData> {
    return apiRequest<CarData>(`/cars/${id}`, {
      method: 'PUT',
      body: JSON.stringify(carData),
    });
  },

  async deleteCar(id: string): Promise<void> {
    return apiRequest<void>(`/cars/${id}`, {
      method: 'DELETE',
    });
  },

  // Policy management
  async getPolicies(): Promise<PolicyData[]> {
    return apiRequest<PolicyData[]>('/policies');
  },

  async addPolicy(policyData: Omit<PolicyData, 'id' | 'lastUpdated'>): Promise<PolicyData> {
    return apiRequest<PolicyData>('/policies', {
      method: 'POST',
      body: JSON.stringify(policyData),
    });
  },

  async updatePolicy(id: string, policyData: Partial<PolicyData>): Promise<PolicyData> {
    return apiRequest<PolicyData>(`/policies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(policyData),
    });
  },

  async deletePolicy(id: string): Promise<void> {
    return apiRequest<void>(`/policies/${id}`, {
      method: 'DELETE',
    });
  },

  // User profile
  async getProfile(): Promise<any> {
    return apiRequest<any>('/auth/profile');
  },

  async updateProfile(profileData: any): Promise<any> {
    return apiRequest<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// Authentication helper
export const authApi = {
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const response = await apiRequest<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store token in localStorage
    localStorage.setItem('authToken', response.token);
    
    return response;
  },

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ token: string; user: any }> {
    const response = await apiRequest<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Store token in localStorage
    localStorage.setItem('authToken', response.token);
    
    return response;
  },

  logout(): void {
    localStorage.removeItem('authToken');
  },
};

export default dashboardApi;
