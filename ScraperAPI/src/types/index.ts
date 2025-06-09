import { Request } from 'express';

export type RequestWithValidatedData = Request<
  {},
  {},
  {
    carReg: string;
    phoneNumber: string;
    isPolicyExpired: boolean;
    hasMadeClaim: boolean;
    hasCngLpg: boolean;
  }
>;

export interface QuoteRequest {
  registrationNumber?: string; // Make optional
  phoneNumber: string;
  isNewCar: boolean; // Add this property
  isPolicyExpired: boolean;
  hasMadeClaim: boolean;
}

export interface InsuranceQuote {
  insurer: string;
  price: string;
  idv?: string;
  planType?: string;
  logoUrl?: string;
  details?: {
    leftPanel?: {
      idvValue?: string | null;
      ncbPercentage?: string | null;
      planType?: string | null;
      finalPrice?: string | null;
    };
    premiumBreakup?: {
      sections: { name: string; items: { key: string; value: string }[] }[];
      total: string | null;
      gst: string | null;
      finalAmount: string | null;
    };
    planDetails?: {
      covered: { title: string; description: string }[];
      notCovered: string[];
    };
    error?: string;
  };
}

export interface ScraperResult {
  success: boolean;
  quotes: InsuranceQuote[];
  error?: string;
}