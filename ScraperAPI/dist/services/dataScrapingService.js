"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeRegistrationPlaces = exports.scrapeCarVariants = exports.scrapeFuelTypes = exports.scrapeCarModels = exports.scrapeCarBrands = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const logger_1 = __importDefault(require("../utils/logger"));
class DataScrapingService {
    browser = null;
    page = null;
    async initBrowser() {
        if (!this.browser) {
            this.browser = await puppeteer_1.default.launch({
                headless: false,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
        if (!this.page) {
            this.page = await this.browser.newPage();
            await this.page.setViewport({ width: 1280, height: 720 });
        }
    }
    async closeBrowser() {
        if (this.page) {
            await this.page.close();
            this.page = null;
        }
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
    async navigateToNewCarFlow() {
        if (!this.page)
            throw new Error('Browser not initialized');
        // Navigate to the insurance site
        await this.page.goto('https://www.insure24.com/car-insurance/?fs=FASTLANE_LANDING&ft=fl');
        await this.page.waitForSelector('.dls-link', { timeout: 30000 });
        // Click on "New Car" option
        const newCarSelector = 'div:nth-of-type(2) > span.dls-link';
        await this.page.waitForSelector(newCarSelector);
        await this.page.click(newCarSelector);
        // Wait for the page to update
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
    async scrapeCarBrands() {
        try {
            await this.initBrowser();
            await this.navigateToNewCarFlow();
            if (!this.page)
                throw new Error('Page not initialized');
            // Look for "See All Brands" button and click it
            try {
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
        finally {
            await this.closeBrowser();
        }
    }
    async scrapeCarModels(brandName) {
        try {
            await this.initBrowser();
            await this.navigateToNewCarFlow();
            if (!this.page)
                throw new Error('Page not initialized');
            // Navigate to brands page
            await this.page.waitForSelector('a.w--button.w--button--empty.w--button--all-make', { timeout: 10000 });
            await this.page.click('a.w--button.w--button--empty.w--button--all-make');
            // Wait for manufacturers list
            await this.page.waitForSelector('div.all-make > div.all-make__item', { timeout: 10000 });
            // Find and click the selected brand
            const brandSelector = await this.page.evaluateHandle((brand) => {
                const divs = document.querySelectorAll('div.all-make__item-text');
                for (const div of divs) {
                    if (div.textContent?.trim().toLowerCase() === brand.toLowerCase()) {
                        return div.parentElement;
                    }
                }
                return null;
            }, brandName);
            if (!brandSelector) {
                throw new Error(`Brand "${brandName}" not found`);
            }
            await brandSelector.click();
            logger_1.default.info(`Clicked on brand: ${brandName}`);
            // Wait for models to load
            await new Promise(resolve => setTimeout(resolve, 3000));
            // Look for "See All Cars" button
            try {
                const seeAllCarsButton = await this.page.evaluateHandle(() => {
                    const elements = Array.from(document.querySelectorAll('button, a, .w--button'));
                    return elements.find(el => {
                        const text = el.textContent?.trim().toLowerCase() || '';
                        return text.includes('see all') && text.includes('cars');
                    }) || null;
                });
                if (seeAllCarsButton) {
                    const element = await seeAllCarsButton.asElement();
                    if (element) {
                        await element.click();
                        logger_1.default.info('Clicked on "See All Cars" button');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
            }
            catch (error) {
                logger_1.default.warn(`Could not find "See All Cars" button: ${error.message}`);
            }
            // Scrape models with multiple selector attempts
            const modelSelectors = [
                'div.all-models__item-text',
                '.car-card-new__title',
                '.car-model',
                '.car-name',
                '.model-name'
            ];
            let models = [];
            for (const selector of modelSelectors) {
                const modelCount = await this.page.evaluate((sel) => {
                    return document.querySelectorAll(sel).length;
                }, selector);
                if (modelCount > 0) {
                    models = await this.page.evaluate((sel, brand) => {
                        const modelElements = document.querySelectorAll(sel);
                        const modelsData = [];
                        modelElements.forEach((element) => {
                            const name = element.textContent?.trim() || '';
                            if (name) {
                                modelsData.push({
                                    id: name.toLowerCase().replace(/\s+/g, '-'),
                                    name: name,
                                    brandId: brand.toLowerCase().replace(/\s+/g, '-')
                                });
                            }
                        });
                        return modelsData;
                    }, selector, brandName);
                    if (models.length > 0)
                        break;
                }
            }
            logger_1.default.info(`Successfully scraped ${models.length} models for brand: ${brandName}`);
            return models;
        }
        catch (error) {
            logger_1.default.error(`Error scraping models for brand ${brandName}: ${error.message}`);
            throw error;
        }
        finally {
            await this.closeBrowser();
        }
    }
    async scrapeFuelTypes(modelName) {
        try {
            // For now, return standard fuel types as scraping this dynamically
            // would require going through the entire flow for each model
            const standardFuelTypes = [
                { id: 'petrol', name: 'Petrol' },
                { id: 'diesel', name: 'Diesel' },
                { id: 'cng', name: 'CNG' },
                { id: 'electric', name: 'Electric' },
                { id: 'hybrid', name: 'Hybrid' }
            ];
            logger_1.default.info(`Returning standard fuel types for model: ${modelName}`);
            return standardFuelTypes;
        }
        catch (error) {
            logger_1.default.error(`Error getting fuel types for model ${modelName}: ${error.message}`);
            throw error;
        }
    }
    async scrapeCarVariants(modelName, fuelType) {
        try {
            // This would require going through the entire flow to scrape variants
            // For now, return some example variants based on the model
            const variants = [
                {
                    id: `${modelName.toLowerCase()}-base`,
                    name: `${modelName} Base`,
                    modelId: modelName.toLowerCase().replace(/\s+/g, '-'),
                    fuelType: fuelType
                },
                {
                    id: `${modelName.toLowerCase()}-mid`,
                    name: `${modelName} Mid`,
                    modelId: modelName.toLowerCase().replace(/\s+/g, '-'),
                    fuelType: fuelType
                },
                {
                    id: `${modelName.toLowerCase()}-top`,
                    name: `${modelName} Top`,
                    modelId: modelName.toLowerCase().replace(/\s+/g, '-'),
                    fuelType: fuelType
                }
            ];
            logger_1.default.info(`Returning example variants for ${modelName} - ${fuelType}`);
            return variants;
        }
        catch (error) {
            logger_1.default.error(`Error getting variants for ${modelName} - ${fuelType}: ${error.message}`);
            throw error;
        }
    }
    async scrapeRegistrationPlaces() {
        try {
            // For now, return standard registration places
            // Scraping this dynamically would require going through the entire flow
            const registrationPlaces = [
                { code: "AN-01", name: "Port Blair", state: "Andaman & Nicobar" },
                { code: "AP-01", name: "Nirmal", state: "Andhra Pradesh" },
                { code: "AR-01", name: "Itanagar", state: "Arunachal Pradesh" },
                { code: "AS-01", name: "Guwahati", state: "Assam" },
                { code: "BR-01", name: "Patna", state: "Bihar" },
                { code: "CH-01", name: "Chandigarh", state: "Chandigarh" },
                { code: "CG-01", name: "Raipur", state: "Chhattisgarh" },
                { code: "DD-01", name: "Daman", state: "Dadra & Nagar Haveli" },
                { code: "DL-01", name: "Delhi", state: "Delhi" },
                { code: "GA-01", name: "Panaji", state: "Goa" },
                { code: "GJ-01", name: "Ahmedabad", state: "Gujarat" },
                { code: "HR-01", name: "Chandigarh", state: "Haryana" },
                { code: "HP-01", name: "Shimla", state: "Himachal Pradesh" },
                { code: "JK-01", name: "Jammu", state: "Jammu & Kashmir" },
                { code: "JH-01", name: "Ranchi", state: "Jharkhand" },
                { code: "KA-01", name: "Bangalore", state: "Karnataka" },
                { code: "KL-01", name: "Thiruvananthapuram", state: "Kerala" },
                { code: "LD-01", name: "Kavaratti", state: "Lakshadweep" },
                { code: "MP-01", name: "Bhopal", state: "Madhya Pradesh" },
                { code: "MH-01", name: "Mumbai", state: "Maharashtra" },
                { code: "MN-01", name: "Imphal", state: "Manipur" },
                { code: "ML-01", name: "Shillong", state: "Meghalaya" },
                { code: "MZ-01", name: "Aizawl", state: "Mizoram" },
                { code: "NL-01", name: "Kohima", state: "Nagaland" },
                { code: "OR-01", name: "Bhubaneswar", state: "Odisha" },
                { code: "PY-01", name: "Puducherry", state: "Puducherry" },
                { code: "PB-01", name: "Chandigarh", state: "Punjab" },
                { code: "RJ-01", name: "Jaipur", state: "Rajasthan" },
                { code: "SK-01", name: "Gangtok", state: "Sikkim" },
                { code: "TN-01", name: "Chennai", state: "Tamil Nadu" },
                { code: "TS-01", name: "Hyderabad", state: "Telangana" },
                { code: "TR-01", name: "Agartala", state: "Tripura" },
                { code: "UP-01", name: "Lucknow", state: "Uttar Pradesh" },
                { code: "UK-01", name: "Dehradun", state: "Uttarakhand" },
                { code: "WB-01", name: "Kolkata", state: "West Bengal" }
            ];
            logger_1.default.info(`Returning ${registrationPlaces.length} registration places`);
            return registrationPlaces;
        }
        catch (error) {
            logger_1.default.error(`Error getting registration places: ${error.message}`);
            throw error;
        }
    }
}
// Create singleton instance
const dataScrapingService = new DataScrapingService();
// Export individual functions
const scrapeCarBrands = () => dataScrapingService.scrapeCarBrands();
exports.scrapeCarBrands = scrapeCarBrands;
const scrapeCarModels = (brandName) => dataScrapingService.scrapeCarModels(brandName);
exports.scrapeCarModels = scrapeCarModels;
const scrapeFuelTypes = (modelName) => dataScrapingService.scrapeFuelTypes(modelName);
exports.scrapeFuelTypes = scrapeFuelTypes;
const scrapeCarVariants = (modelName, fuelType) => dataScrapingService.scrapeCarVariants(modelName, fuelType);
exports.scrapeCarVariants = scrapeCarVariants;
const scrapeRegistrationPlaces = () => dataScrapingService.scrapeRegistrationPlaces();
exports.scrapeRegistrationPlaces = scrapeRegistrationPlaces;
