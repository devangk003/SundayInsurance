"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInsuranceQuotes = void 0;
const scraperService_1 = require("../services/scraperService");
const logger_1 = __importDefault(require("../utils/logger"));
const getInsuranceQuotes = async (req, res) => {
    try {
        const quoteRequest = {
            registrationNumber: req.body.carReg,
            phoneNumber: req.body.phoneNumber,
            isPolicyExpired: req.body.isPolicyExpired,
            hasMadeClaim: req.body.hasMadeClaim,
            isNewCar: req.body.isNewCar || false // Default to false if not provided
        };
        logger_1.default.info(`Processing quote request for ${quoteRequest.registrationNumber}`);
        const result = await (0, scraperService_1.scrapeInsuranceQuotes)(quoteRequest);
        if (result.success) {
            // Format quotes for better readability
            const formattedQuotes = result.quotes.map((quote, index) => {
                const formattedQuote = {
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
                        coverages: quote.details.planDetails?.covered?.map((c) => c.title) || [],
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
        }
        else {
            return res.status(500).json({
                success: false,
                error: result.error || 'Failed to retrieve quotes'
            });
        }
    }
    catch (error) {
        logger_1.default.error(`Controller error: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: 'An unexpected error occurred'
        });
    }
};
exports.getInsuranceQuotes = getInsuranceQuotes;
// Helper function to flatten premium breakup sections into a single array
function flattenPremiumBreakup(premiumBreakup) {
    if (!premiumBreakup)
        return [];
    const result = [];
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
function formatInsurer(insurer) {
    // Convert hyphenated names to proper title case
    return insurer
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
