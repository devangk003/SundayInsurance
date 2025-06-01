"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuoteRequest = void 0;
const validateQuoteRequest = (req, res, next) => {
    const { carReg, phoneNumber, isNewCar } = req.body;
    // Validate phone number (always required)
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
        return res.status(400).json({
            success: false,
            error: "Valid phone number is required (10 digits)"
        });
    }
    // Only validate registration number if it's not a new car
    if (!isNewCar && (!carReg || carReg.trim() === '')) {
        return res.status(400).json({
            success: false,
            error: "Registration number is required for existing cars"
        });
    }
    // All validation passed
    next();
};
exports.validateQuoteRequest = validateQuoteRequest;
