"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const logger_1 = __importDefault(require("../utils/logger"));
class SessionScrapingService {
    static instance;
    browser = null;
    page = null;
    sessionState = { currentStep: 'initial' };
    isInitialized = false;
    constructor() { }
    static getInstance() {
        if (!SessionScrapingService.instance) {
            SessionScrapingService.instance = new SessionScrapingService();
        }
        return SessionScrapingService.instance;
    }
    async initBrowser() {
        if (!this.browser || !this.page) {
            this.browser = await puppeteer_1.default.launch({
                headless: false,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                defaultViewport: { width: 1280, height: 720 }
            });
            this.page = await this.browser.newPage();
            await this.page.setViewport({ width: 1280, height: 720 });
            // Navigate to the insurance site initially
            await this.page.goto('https://www.insure24.com/car-insurance/?fs=FASTLANE_LANDING&ft=fl');
            await this.page.waitForSelector('.dls-link', { timeout: 30000 });
            // Click on "New Car" option
            const newCarSelector = 'div:nth-of-type(2) > span.dls-link';
            await this.page.waitForSelector(newCarSelector);
            await this.page.click(newCarSelector);
            // Wait for the page to update
            await new Promise(resolve => setTimeout(resolve, 3000));
            this.isInitialized = true;
            this.sessionState.currentStep = 'brands';
            logger_1.default.info('Browser session initialized and ready for scraping');
        }
    }
    async initializeSession() {
        if (!this.isInitialized) {
            await this.initBrowser();
        }
    }
    async scrapeCarBrands() {
        try {
            await this.initializeSession();
            if (!this.page)
                throw new Error('Page not initialized');
            // Navigate to all brands page if not already there
            if (this.sessionState.currentStep === 'brands') {
                try {
                    // Look for "See All Brands" button and click it
                    const brandButtonSelectors = [
                        'a.w--button.w--button--empty.w--button--all-make',
                        'button.w--button--all-make',
                        'a:contains("See All Brands")',
                        'button:contains("See All Brands")',
                        '.all-make-button'
                    ];
                    let brandButtonFound = false;
                    for (const selector of brandButtonSelectors) {
                        try {
                            await this.page.waitForSelector(selector, { timeout: 5000 });
                            await this.page.click(selector);
                            brandButtonFound = true;
                            logger_1.default.info(`Clicked on See All Brands using selector: ${selector}`);
                            break;
                        }
                        catch (err) {
                            logger_1.default.warn(`Failed with brand button selector ${selector}`);
                        }
                    }
                    if (!brandButtonFound) {
                        // Check if we're already on the manufacturers page
                        const manufacturersExist = await this.page.evaluate(() => {
                            return document.querySelectorAll('div.all-make__item').length > 0;
                        });
                        if (!manufacturersExist) {
                            throw new Error('Could not find manufacturers page');
                        }
                    }
                }
                catch (error) {
                    logger_1.default.error(`Failed to navigate to brands page: ${error.message}`);
                    throw error;
                }
                // Wait for manufacturers list to load
                await this.page.waitForSelector('div.all-make > div.all-make__item', { timeout: 10000 });
            }
            // Scrape car brands
            const brands = await this.page.evaluate(() => {
                const brandElements = document.querySelectorAll('div.all-make__item');
                const brandsData = [];
                brandElements.forEach((element, index) => {
                    const nameElement = element.querySelector('div.all-make__item-text');
                    const logoElement = element.querySelector('img');
                    if (nameElement) {
                        const name = nameElement.textContent?.trim() || '';
                        const logo = logoElement?.getAttribute('src') || '';
                        brandsData.push({
                            id: name.toLowerCase().replace(/\s+/g, '-'),
                            name: name,
                            logo: logo
                        });
                    }
                });
                return brandsData;
            });
            logger_1.default.info(`Successfully scraped ${brands.length} car brands`);
            return brands;
        }
        catch (error) {
            logger_1.default.error(`Error scraping car brands: ${error.message}`);
            throw error;
        }
    }
    // Separate method to just select a brand
    async selectBrand(brandName) {
        try {
            if (!this.page)
                throw new Error('Page not initialized');
            // Find and click the selected brand
            const brandClicked = await this.page.evaluate((brand) => {
                const divs = document.querySelectorAll('div.all-make__item-text');
                for (const div of divs) {
                    if (div.textContent?.trim().toLowerCase() === brand.toLowerCase()) {
                        const brandElement = div.parentElement;
                        if (brandElement) {
                            brandElement.click();
                            return true;
                        }
                    }
                }
                return false;
            }, brandName);
            if (!brandClicked) {
                throw new Error(`Brand "${brandName}" not found`);
            }
            logger_1.default.info(`Clicked on brand: ${brandName}`);
            this.sessionState.selectedBrand = brandName;
            this.sessionState.currentStep = 'models';
            // Wait for models to load
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        catch (error) {
            logger_1.default.error(`Error selecting brand: ${error.message}`);
            throw error;
        }
    }
    // Separate method to get available models
    async getAvailableModels() {
        try {
            if (!this.page)
                throw new Error('Page not initialized');
            if (this.sessionState.currentStep !== 'models') {
                throw new Error('Must select a brand first');
            }
            // Wait for the models page to load (look for different possible selectors)
            const modelSelectors = [
                'div.all-models__item',
                '.model-item',
                '[data-model]',
                'div.w--multi_select_dd_element'
            ];
            let modelsSelector = '';
            for (const selector of modelSelectors) {
                try {
                    await this.page.waitForSelector(selector, { timeout: 5000 });
                    modelsSelector = selector;
                    break;
                }
                catch (err) {
                    logger_1.default.warn(`Model selector ${selector} not found, trying next...`);
                }
            }
            if (!modelsSelector) {
                throw new Error('Models page not loaded properly');
            }
            // Scrape car models
            const models = await this.page.evaluate((selector) => {
                const modelElements = document.querySelectorAll(selector);
                const modelsData = [];
                modelElements.forEach((element, index) => {
                    const name = element.textContent?.trim() || '';
                    if (name) {
                        modelsData.push({
                            id: name.toLowerCase().replace(/\s+/g, '-'),
                            name: name,
                            brandId: ''
                        });
                    }
                });
                return modelsData;
            }, modelsSelector);
            logger_1.default.info(`Successfully scraped ${models.length} models for ${this.sessionState.selectedBrand}`);
            return models;
        }
        catch (error) {
            logger_1.default.error(`Error getting available models: ${error.message}`);
            throw error;
        }
    }
    // Legacy method for backward compatibility
    async selectBrandAndGetModels(brandName) {
        await this.selectBrand(brandName);
        return this.getAvailableModels();
    }
    // Separate method to just select a model
    async selectModel(modelName) {
        try {
            if (!this.page)
                throw new Error('Page not initialized');
            // Find and click the selected model
            const modelClicked = await this.page.evaluate((model) => {
                const elements = document.querySelectorAll('div.all-models__item, .model-item, [data-model], div.w--multi_select_dd_element');
                for (const element of elements) {
                    if (element.textContent?.trim().toLowerCase() === model.toLowerCase()) {
                        element.click();
                        return true;
                    }
                }
                return false;
            }, modelName);
            if (!modelClicked) {
                throw new Error(`Model "${modelName}" not found`);
            }
            logger_1.default.info(`Clicked on model: ${modelName}`);
            this.sessionState.selectedModel = modelName;
            this.sessionState.currentStep = 'fuelTypes';
            // Wait for fuel types page to load
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        catch (error) {
            logger_1.default.error(`Error selecting model: ${error.message}`);
            throw error;
        }
    }
    // Separate method to get available fuel types
    async getAvailableFuelTypes() {
        try {
            if (!this.page)
                throw new Error('Page not initialized');
            if (this.sessionState.currentStep !== 'fuelTypes') {
                throw new Error('Must select a model first');
            }
            // Look for fuel type elements
            const fuelTypeSelectors = [
                'div.w--multi_select_dd_element',
                '.fuel-type-item',
                '[data-fuel-type]'
            ];
            let fuelTypesSelector = '';
            for (const selector of fuelTypeSelectors) {
                try {
                    await this.page.waitForSelector(selector, { timeout: 5000 });
                    fuelTypesSelector = selector;
                    break;
                }
                catch (err) {
                    logger_1.default.warn(`Fuel type selector ${selector} not found, trying next...`);
                }
            }
            if (!fuelTypesSelector) {
                // Return common fuel types as fallback
                return [
                    { id: 'petrol', name: 'Petrol' },
                    { id: 'diesel', name: 'Diesel' },
                    { id: 'cng', name: 'CNG' },
                    { id: 'electric', name: 'Electric' },
                    { id: 'hybrid', name: 'Hybrid' }
                ];
            }
            // Scrape fuel types
            const fuelTypes = await this.page.evaluate((selector) => {
                const fuelTypeElements = document.querySelectorAll(selector);
                const fuelTypesData = [];
                fuelTypeElements.forEach((element, index) => {
                    const name = element.textContent?.trim() || '';
                    if (name) {
                        fuelTypesData.push({
                            id: name.toLowerCase().replace(/\s+/g, '-'),
                            name: name
                        });
                    }
                });
                return fuelTypesData;
            }, fuelTypesSelector);
            logger_1.default.info(`Successfully scraped ${fuelTypes.length} fuel types for ${this.sessionState.selectedModel}`);
            return fuelTypes;
        }
        catch (error) {
            logger_1.default.error(`Error getting available fuel types: ${error.message}`);
            throw error;
        }
    }
    // Legacy method for backward compatibility
    async selectModelAndGetFuelTypes(modelName) {
        await this.selectModel(modelName);
        return this.getAvailableFuelTypes();
    }
    // Separate method to just select a fuel type
    async selectFuelType(fuelType) {
        try {
            if (!this.page)
                throw new Error('Page not initialized');
            // Find and click the selected fuel type
            const fuelTypeClicked = await this.page.evaluate((fuel) => {
                const elements = document.querySelectorAll('div.w--multi_select_dd_element, .fuel-type-item, [data-fuel-type]');
                for (const element of elements) {
                    if (element.textContent?.trim().toLowerCase() === fuel.toLowerCase()) {
                        element.click();
                        return true;
                    }
                }
                return false;
            }, fuelType);
            if (!fuelTypeClicked) {
                throw new Error(`Fuel type "${fuelType}" not found`);
            }
            logger_1.default.info(`Clicked on fuel type: ${fuelType}`);
            this.sessionState.selectedFuelType = fuelType;
            this.sessionState.currentStep = 'variants';
            // Wait for variants page to load
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        catch (error) {
            logger_1.default.error(`Error selecting fuel type: ${error.message}`);
            throw error;
        }
    }
    // Separate method to get available variants
    async getAvailableVariants() {
        try {
            if (!this.page)
                throw new Error('Page not initialized');
            if (this.sessionState.currentStep !== 'variants') {
                throw new Error('Must select a fuel type first');
            }
            // Wait for variants list to load - matching the test.html structure
            await this.page.waitForSelector('div.w--multi_select_dd_element', { timeout: 10000 });
            // Scrape car variants
            const variants = await this.page.evaluate(() => {
                const variantElements = document.querySelectorAll('div.w--multi_select_dd_element');
                const variantsData = [];
                variantElements.forEach((element, index) => {
                    const name = element.textContent?.trim() || '';
                    if (name) {
                        variantsData.push({
                            id: name.toLowerCase().replace(/\s+/g, '-'),
                            name: name,
                            modelId: '',
                            fuelType: ''
                        });
                    }
                });
                return variantsData;
            });
            logger_1.default.info(`Successfully scraped ${variants.length} variants for ${this.sessionState.selectedFuelType}`);
            return variants;
        }
        catch (error) {
            logger_1.default.error(`Error getting available variants: ${error.message}`);
            throw error;
        }
    }
    // Legacy method for backward compatibility
    async selectFuelTypeAndGetVariants(fuelType) {
        await this.selectFuelType(fuelType);
        return this.getAvailableVariants();
    }
    // Separate method to just select a variant
    async selectVariant(variant) {
        try {
            if (!this.page)
                throw new Error('Page not initialized');
            // Find and click the selected variant
            const variantClicked = await this.page.evaluate((selectedVariant) => {
                const elements = document.querySelectorAll('div.w--multi_select_dd_element');
                for (const element of elements) {
                    if (element.textContent?.trim().toLowerCase() === selectedVariant.toLowerCase()) {
                        element.click();
                        return true;
                    }
                }
                return false;
            }, variant);
            if (!variantClicked) {
                throw new Error(`Variant "${variant}" not found`);
            }
            logger_1.default.info(`Clicked on variant: ${variant}`);
            this.sessionState.selectedVariant = variant;
            this.sessionState.currentStep = 'registration';
            // Wait for registration page to load
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        catch (error) {
            logger_1.default.error(`Error selecting variant: ${error.message}`);
            throw error;
        }
    }
    // Separate method to get available registration places
    async getAvailableRegistrationPlaces() {
        try {
            if (!this.page)
                throw new Error('Page not initialized');
            if (this.sessionState.currentStep !== 'registration') {
                throw new Error('Must select a variant first');
            }
            // Wait for registration places list to load
            await this.page.waitForSelector('div.w--multi_select_dd_element', { timeout: 10000 });
            // Scrape registration places
            const registrationPlaces = await this.page.evaluate(() => {
                const placeElements = document.querySelectorAll('div.w--multi_select_dd_element');
                const placesData = [];
                placeElements.forEach((element, index) => {
                    const fullText = element.textContent?.trim() || '';
                    if (fullText) {
                        // Parse format like "MH-01 Mumbai" or "AN-01 Port Blair"
                        const parts = fullText.split(' ');
                        const code = parts[0] || '';
                        const name = parts.slice(1).join(' ') || fullText;
                        placesData.push({
                            id: code,
                            code: code,
                            name: name,
                            state: code.split('-')[0] || ''
                        });
                    }
                });
                return placesData;
            });
            logger_1.default.info(`Successfully scraped ${registrationPlaces.length} registration places`);
            return registrationPlaces;
        }
        catch (error) {
            logger_1.default.error(`Error getting available registration places: ${error.message}`);
            throw error;
        }
    }
    // Legacy method for backward compatibility
    async selectVariantAndGetRegistrationPlaces(variant) {
        await this.selectVariant(variant);
        return this.getAvailableRegistrationPlaces();
    }
    getSessionState() {
        return { ...this.sessionState };
    }
    async resetSession() {
        try {
            if (this.browser) {
                await this.browser.close();
            }
        }
        catch (error) {
            logger_1.default.warn(`Error closing browser: ${error.message}`);
        }
        finally {
            this.browser = null;
            this.page = null;
            this.isInitialized = false;
            this.sessionState = { currentStep: 'initial' };
            logger_1.default.info('Session reset successfully');
        }
    }
}
exports.default = SessionScrapingService;
