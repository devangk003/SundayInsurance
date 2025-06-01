"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scrapeController_1 = require("../controllers/scrapeController");
const dataController_1 = require("../controllers/dataController");
const validation_1 = require("../middlewares/validation");
const router = (0, express_1.Router)();
// Dynamic data endpoints with session support
router.get('/brands', dataController_1.getBrands);
router.get('/models', dataController_1.getModels); // Get available models after brand selection
router.get('/fuel-types', dataController_1.getFuelTypes); // Get available fuel types after model selection
router.get('/variants', dataController_1.getVariants); // Get available variants after fuel type selection
router.get('/registration-places', dataController_1.getRegistrationPlaces); // Get available registration places after variant selection
// Selection endpoints (perform the actual clicks/selections)
router.post('/select/brand/:brandId', dataController_1.selectBrand);
router.post('/select/model/:modelId', dataController_1.selectModel);
router.post('/select/fuel-type/:fuelType', dataController_1.selectFuelType);
router.post('/select/variant/:variantId', dataController_1.selectVariant);
// Legacy endpoints for backward compatibility
router.get('/models/:brandId', dataController_1.getModels);
router.get('/fuel-types/:modelId', dataController_1.getFuelTypes);
router.get('/variants/:modelId/:fuelType', dataController_1.getVariants);
router.get('/registration-places/:variantId', dataController_1.getRegistrationPlaces);
// Session management endpoints
router.post('/reset-session', dataController_1.resetSession);
router.get('/session-state', dataController_1.getSessionState);
// Existing quote endpoint
router.post('/api/quotes', (req, res, next) => {
    const { carReg, phoneNumber, isPolicyExpired, hasMadeClaim, isNewCar } = req.body;
    // Phone number is always required
    if (!phoneNumber) {
        return res.status(400).json({
            success: false,
            error: "Phone number is required"
        });
    }
    // Only validate registration if not a new car
    if (!isNewCar && !carReg) {
        return res.status(400).json({
            success: false,
            error: "Registration number is required for existing cars"
        });
    }
    next();
});
router.post('/quotes', validation_1.validateQuoteRequest, scrapeController_1.getInsuranceQuotes);
exports.default = router;
