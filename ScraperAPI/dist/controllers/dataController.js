"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionState = exports.resetSession = exports.selectVariant = exports.getRegistrationPlaces = exports.selectFuelType = exports.getVariants = exports.selectModel = exports.getFuelTypes = exports.selectBrand = exports.getModels = exports.getBrands = void 0;
const sessionScrapingService_1 = __importDefault(require("../services/sessionScrapingService"));
const logger_1 = __importDefault(require("../utils/logger"));
// Get singleton instance of the session scraping service
const scrapingService = sessionScrapingService_1.default.getInstance();
const getBrands = async (req, res) => {
    try {
        logger_1.default.info('Fetching car brands...');
        const brands = await scrapingService.scrapeCarBrands();
        return res.status(200).json({
            success: true,
            data: brands
        });
    }
    catch (error) {
        logger_1.default.error(`Error fetching brands: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch car brands'
        });
    }
};
exports.getBrands = getBrands;
const getModels = async (req, res) => {
    try {
        logger_1.default.info('Fetching available models...');
        const models = await scrapingService.getAvailableModels();
        return res.status(200).json({
            success: true,
            data: models
        });
    }
    catch (error) {
        logger_1.default.error(`Error fetching models: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch car models'
        });
    }
};
exports.getModels = getModels;
const selectBrand = async (req, res) => {
    try {
        const { brandId } = req.params;
        logger_1.default.info(`Selecting brand: ${brandId}`);
        await scrapingService.selectBrand(brandId);
        return res.status(200).json({
            success: true,
            message: `Brand ${brandId} selected successfully`
        });
    }
    catch (error) {
        logger_1.default.error(`Error selecting brand: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: 'Failed to select brand'
        });
    }
};
exports.selectBrand = selectBrand;
const getFuelTypes = async (req, res) => {
    try {
        logger_1.default.info('Fetching available fuel types...');
        const fuelTypes = await scrapingService.getAvailableFuelTypes();
        return res.status(200).json({
            success: true,
            data: fuelTypes
        });
    }
    catch (error) {
        logger_1.default.error(`Error fetching fuel types: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch fuel types'
        });
    }
};
exports.getFuelTypes = getFuelTypes;
const selectModel = async (req, res) => {
    try {
        const { modelId } = req.params;
        logger_1.default.info(`Selecting model: ${modelId}`);
        await scrapingService.selectModel(modelId);
        return res.status(200).json({
            success: true,
            message: `Model ${modelId} selected successfully`
        });
    }
    catch (error) {
        logger_1.default.error(`Error selecting model: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: 'Failed to select model'
        });
    }
};
exports.selectModel = selectModel;
const getVariants = async (req, res) => {
    try {
        logger_1.default.info('Fetching available variants...');
        const variants = await scrapingService.getAvailableVariants();
        return res.status(200).json({
            success: true,
            data: variants
        });
    }
    catch (error) {
        logger_1.default.error(`Error fetching variants: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch car variants'
        });
    }
};
exports.getVariants = getVariants;
const selectFuelType = async (req, res) => {
    try {
        const { fuelType } = req.params;
        logger_1.default.info(`Selecting fuel type: ${fuelType}`);
        await scrapingService.selectFuelType(fuelType);
        return res.status(200).json({
            success: true,
            message: `Fuel type ${fuelType} selected successfully`
        });
    }
    catch (error) {
        logger_1.default.error(`Error selecting fuel type: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: 'Failed to select fuel type'
        });
    }
};
exports.selectFuelType = selectFuelType;
const getRegistrationPlaces = async (req, res) => {
    try {
        logger_1.default.info('Fetching available registration places...');
        const places = await scrapingService.getAvailableRegistrationPlaces();
        return res.status(200).json({
            success: true,
            data: places
        });
    }
    catch (error) {
        logger_1.default.error(`Error fetching registration places: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch registration places'
        });
    }
};
exports.getRegistrationPlaces = getRegistrationPlaces;
const selectVariant = async (req, res) => {
    try {
        const { variantId } = req.params;
        logger_1.default.info(`Selecting variant: ${variantId}`);
        await scrapingService.selectVariant(variantId);
        return res.status(200).json({
            success: true,
            message: `Variant ${variantId} selected successfully`
        });
    }
    catch (error) {
        logger_1.default.error(`Error selecting variant: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: 'Failed to select variant'
        });
    }
};
exports.selectVariant = selectVariant;
// New endpoint to reset session
const resetSession = async (req, res) => {
    try {
        logger_1.default.info('Resetting scraping session...');
        await scrapingService.resetSession();
        return res.status(200).json({
            success: true,
            message: 'Session reset successfully'
        });
    }
    catch (error) {
        logger_1.default.error(`Error resetting session: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: 'Failed to reset session'
        });
    }
};
exports.resetSession = resetSession;
// New endpoint to get session state
const getSessionState = async (req, res) => {
    try {
        const sessionState = scrapingService.getSessionState();
        return res.status(200).json({
            success: true,
            data: sessionState
        });
    }
    catch (error) {
        logger_1.default.error(`Error getting session state: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: 'Failed to get session state'
        });
    }
};
exports.getSessionState = getSessionState;
