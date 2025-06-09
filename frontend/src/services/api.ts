// API service for communicating with ScraperAPI
const API_BASE_URL = 'http://localhost:3000/api';

export interface QuoteRequest {
  name: string;
  phone: string;
  registrationNumber: string;
}

export interface InsuranceQuote {
  quoteNumber: number;
  insurer: string;
  premium: string;
  idv: string;
  planType: string;
  logoUrl: string;
  details?: {
    coverages: string[];
    exclusions: string[];
    ncb: string;
    premiumBreakup: Array<{ label: string; value: string }>;
  };
}

export interface QuoteResponse {
  success: boolean;
  vehicleRegistration?: string;
  totalQuotes?: number;
  quotes?: InsuranceQuote[];
  error?: string;
}

export const fetchInsuranceQuotes = async (formData: QuoteRequest): Promise<QuoteResponse> => {
  try {
    // Map frontend form data to API payload structure
    const apiPayload = {
      carReg: formData.registrationNumber,
      phoneNumber: formData.phone,
      isNewCar: false, // Always use existing car flow for now
      isPolicyExpired: false, // Set reasonable default
      hasMadeClaim: false // Set reasonable default
    };

    const response = await fetch(`${API_BASE_URL}/quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch quotes');
    }

    const data: QuoteResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching insurance quotes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
};