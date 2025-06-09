import { Request, Response } from 'express';
import { scrapeInsuranceQuotes } from '../services/scraperService';
import { QuoteRequest, InsuranceQuote } from '../types';
import logger from '../utils/logger';

// Add this interface for the formatted quote
interface FormattedQuote {
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

export const getInsuranceQuotes = async (req: Request, res: Response) => {
  try {
    const quoteRequest: QuoteRequest = {
      registrationNumber: req.body.carReg,
      phoneNumber: req.body.phoneNumber,
      isPolicyExpired: req.body.isPolicyExpired,
      hasMadeClaim: req.body.hasMadeClaim,
      isNewCar: req.body.isNewCar || false // Default to false if not provided
    };
    
    logger.info(`Processing quote request for ${quoteRequest.registrationNumber}`);
    
    const result = await scrapeInsuranceQuotes(quoteRequest);
    
    if (result.success) {
      // Format quotes for better readability
      const formattedQuotes = result.quotes.map((quote, index) => {
        const formattedQuote: FormattedQuote = {
          quoteNumber: index + 1,
          insurer: formatInsurer(quote.insurer),
          premium: `₹${quote.price}`,
          idv: quote.idv ? `₹${quote.idv}` : 'Not specified',
          planType: quote.planType || 'Standard',
          logoUrl: quote.logoUrl || 'No logo available'
        };
        
        // Include details information if available
        if (quote.details) {
          formattedQuote.details = {
            // Access the correct nested properties
            coverages: quote.details.planDetails?.covered?.map((c: { title: string; description: string }) => c.title) || [],
            exclusions: quote.details.planDetails?.notCovered || [],
            ncb: quote.details.leftPanel?.ncbPercentage || 'Not available',
            // Convert the premium breakup sections to the expected format
            premiumBreakup: flattenPremiumBreakup(quote.details.premiumBreakup)
          };
        }
        
        return formattedQuote;
      });

      return res.status(200).json({
        success: true,
        vehicleRegistration: quoteRequest.registrationNumber,
        totalQuotes: result.quotes.length,
        quotes: formattedQuotes
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to retrieve quotes'
      });
    }
  } catch (error) {
    logger.error(`Controller error: ${(error as Error).message}`);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred'
    });
  }
};

// Helper function to flatten premium breakup sections into a single array
function flattenPremiumBreakup(
  premiumBreakup?: { 
    sections: { name: string; items: { key: string; value: string }[] }[]; 
    total: string | null; 
    gst: string | null; 
    finalAmount: string | null; 
  }
): Array<{ label: string; value: string }> {
  if (!premiumBreakup) return [];
  
  const result: Array<{ label: string; value: string }> = [];
  
  // Add all items from all sections
  premiumBreakup.sections.forEach(section => {
    section.items.forEach(item => {
      result.push({ label: item.key, value: item.value });
    });
  });
  
  // Add total, GST and final amount if available
  if (premiumBreakup.total) {
    result.push({ label: 'Total Premium', value: premiumBreakup.total });
  }
  
  if (premiumBreakup.gst) {
    result.push({ label: 'GST', value: premiumBreakup.gst });
  }
  
  if (premiumBreakup.finalAmount) {
    result.push({ label: 'Final Amount', value: premiumBreakup.finalAmount });
  }
  
  return result;
}

// Helper function to format insurer names nicely
function formatInsurer(insurer: string): string {
  // Convert hyphenated names to proper title case
  return insurer
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}