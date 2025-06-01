"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeInsuranceQuotes = scrapeInsuranceQuotes;
exports.scrapeOptions = scrapeOptions;
exports.searchAndSelectOption = searchAndSelectOption;
exports.sanitizeText = sanitizeText;
const puppeteer = __importStar(require("puppeteer"));
const logger_1 = __importDefault(require("../utils/logger"));
const config_1 = __importDefault(require("../config/config"));
const readline_1 = __importDefault(require("readline"));
// Helper function to extract text from elements
async function scrapeOptions(page, selector) {
    logger_1.default.info(`Scraping options with selector: ${selector}`);
    const results = await page.evaluate((sel) => {
        const elements = document.querySelectorAll(sel);
        console.log(`Found ${elements.length} elements matching selector ${sel}`);
        // Extract text from elements
        const textArray = Array.from(elements)
            .map(el => el.textContent?.trim() || '')
            .filter(text => text.length > 0);
        console.log(`Returning ${textArray.length} non-empty text items`);
        return textArray;
    }, selector);
    logger_1.default.info(`Scraped ${results.length} options: ${results.slice(0, 5).join(', ')}${results.length > 5 ? '...' : ''}`);
    return results;
}
// New helper function to search for items in large lists
async function searchAndSelectOption(page, searchTerm, searchBoxSelector, optionsSelector) {
    logger_1.default.info(`Searching for '${searchTerm}' in dropdown`);
    // Clear and fill the search box
    await page.click(searchBoxSelector);
    await page.evaluate(selector => {
        const input = document.querySelector(selector);
        if (input)
            input.value = '';
    }, searchBoxSelector);
    await page.type(searchBoxSelector, searchTerm, { delay: 100 });
    logger_1.default.info(`Entered search term: ${searchTerm}`);
    // Wait for filtered results
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Check if any options match
    const matchingOptions = await page.evaluate((selector, term) => {
        const options = document.querySelectorAll(selector);
        const matches = Array.from(options)
            .filter(opt => opt.textContent?.toLowerCase().includes(term.toLowerCase()))
            .map(opt => ({ text: opt.textContent?.trim() || '', element: opt }));
        console.log(`Found ${matches.length} matches for '${term}'`);
        // Click the first match if available
        if (matches.length > 0) {
            matches[0].element.click();
            return { success: true, selected: matches[0].text };
        }
        return { success: false, matches: matches.map(m => m.text) };
    }, optionsSelector, searchTerm);
    if (matchingOptions.success) {
        logger_1.default.info(`Successfully selected: ${matchingOptions.selected}`);
        return true;
    }
    else {
        logger_1.default.warn(`No exact matches found for '${searchTerm}'. Available matches: ${JSON.stringify(matchingOptions.matches)}`);
        return false;
    }
}
// Add this function to sanitize text before displaying
function sanitizeText(text) {
    if (!text)
        return '';
    return text
        .replace(/â€¢/g, '') // Remove bullet points
        .replace(/â€™/g, '') // Remove apostrophes
        .replace(/â€"/g, '') // Remove en-dash
        .replace(/â€"/g, '') // Remove em-dash
        .replace(/â€œ/g, '') // Remove opening quotes
        .replace(/â€/g, ''); // Remove closing quotes
}
async function scrapeInsuranceQuotes(request) {
    // Create new readline interface for this session only
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    // Helper function to prompt user for choices (local to this function)
    function promptUser(question, options) {
        return new Promise((resolve) => {
            if (options && options.length > 0) {
                console.log(question);
                options.forEach((option, index) => {
                    console.log(`${index + 1}. ${option}`);
                });
                rl.question('Enter your choice (number): ', (answer) => {
                    const choice = parseInt(answer);
                    if (isNaN(choice) || choice < 1 || choice > options.length) {
                        console.log('Invalid choice. Please try again.');
                        resolve(promptUser(question, options));
                    }
                    else {
                        resolve(options[choice - 1]);
                    }
                });
            }
            else {
                rl.question(`${question}: `, (answer) => {
                    resolve(answer);
                });
            }
        });
    }
    // Launch browser
    const browser = await puppeteer.launch({
        headless: false, // Set to true in production
        defaultViewport: { width: 1280, height: 800 }
    });
    try {
        logger_1.default.info(`Starting scraping session. New car: ${request.isNewCar ? 'Yes' : 'No'}`);
        const page = await browser.newPage();
        // Enable better debugging
        page.on('console', msg => logger_1.default.info(`Browser console: ${msg.text()}`));
        // Navigate to the insurance website
        await page.goto(config_1.default.TARGET_URL);
        logger_1.default.info('Navigated to target URL');
        // Take a screenshot to debug initial state
        await page.screenshot({ path: 'initial-page.png' });
        logger_1.default.info('Initial page screenshot saved');
        if (request.isNewCar) {
            // ===== NEW CAR FLOW =====
            logger_1.default.info('Starting new car flow');
            // Wait longer for the page to fully load and stabilize
            await new Promise(resolve => setTimeout(resolve, 3000));
            // Find and click on "New Car" option with a more robust approach
            try {
                logger_1.default.info('Looking for New Car button');
                // First try the original selector
                const newCarSelector = 'div.flow-links__item > span.dls-link';
                await page.waitForSelector(newCarSelector, { timeout: 10000 });
                // Take screenshot before clicking
                await page.screenshot({ path: 'before-newcar-click.png' });
                // Click the New Car button
                await page.click(newCarSelector);
                logger_1.default.info('Clicked on New Car option');
                // Wait for the page to update after clicking
                await new Promise(resolve => setTimeout(resolve, 2000));
                // Take a screenshot after clicking
                await page.screenshot({ path: 'after-newcar-click.png' });
            }
            catch (error) {
                logger_1.default.error(`Failed to click New Car button: ${error.message}`);
                // Alternative selectors to try
                const alternativeSelectors = [
                    'a.dls-link:contains("new car")',
                    'div.flow-links__item a.dls-link',
                    'span.dls-link:contains("new car")'
                ];
                let clicked = false;
                for (const selector of alternativeSelectors) {
                    try {
                        logger_1.default.info(`Trying alternative selector: ${selector}`);
                        await page.waitForSelector(selector, { timeout: 5000 });
                        await page.click(selector);
                        clicked = true;
                        logger_1.default.info(`Successfully clicked using selector: ${selector}`);
                        break;
                    }
                    catch (err) {
                        logger_1.default.warn(`Failed with selector ${selector}: ${err.message}`);
                    }
                }
                if (!clicked) {
                    throw new Error('Could not click on New Car option with any selector');
                }
            }
            // Wait for the page to update after New Car selection
            await new Promise(resolve => setTimeout(resolve, 3000));
            // Step 1: Get and present car manufacturers
            logger_1.default.info('Looking for See All Brands button');
            try {
                // Take screenshot to see current state
                await page.screenshot({ path: 'before-brands.png' });
                // Try multiple possible selectors for the "See All Brands" button
                const brandButtonSelectors = [
                    'a.w--button.w--button--empty.w--button--all-make',
                    'button.w--button--all-make',
                    'a:contains("See All Brands")',
                    'button:contains("See All Brands")',
                    '.all-make-button',
                    '.w--button:contains("brands")'
                ];
                let brandButtonFound = false;
                for (const selector of brandButtonSelectors) {
                    try {
                        logger_1.default.info(`Trying brand button selector: ${selector}`);
                        await page.waitForSelector(selector, { timeout: 5000 });
                        await page.click(selector);
                        brandButtonFound = true;
                        logger_1.default.info(`Clicked on See All Brands using selector: ${selector}`);
                        break;
                    }
                    catch (err) {
                        logger_1.default.warn(`Failed with brand button selector ${selector}`);
                    }
                }
                if (!brandButtonFound) {
                    // Try to inspect what's on the page
                    logger_1.default.info('Could not find See All Brands button. Inspecting page content...');
                    const pageContent = await page.content();
                    logger_1.default.info(`Page HTML length: ${pageContent.length} characters`);
                    // Check if we're already on the manufacturers page
                    const manufacturersExist = await page.evaluate(() => {
                        return document.querySelectorAll('div.all-make__item').length > 0;
                    });
                    if (manufacturersExist) {
                        logger_1.default.info('Already on manufacturers page, proceeding');
                    }
                    else {
                        throw new Error('Could not find See All Brands button with any selector');
                    }
                }
            }
            catch (error) {
                logger_1.default.error(`Failed to find or click See All Brands: ${error.message}`);
                throw error;
            }
            // Wait for the manufacturers list to load
            try {
                logger_1.default.info('Waiting for manufacturers list to load');
                await page.waitForSelector('div.all-make > div.all-make__item', { timeout: 10000 });
            }
            catch (error) {
                logger_1.default.error(`Failed to find manufacturers list: ${error.message}`);
                // Take screenshot to debug
                await page.screenshot({ path: 'manufacturers-error.png' });
                // Try to determine what page we're on
                const currentUrl = await page.url();
                logger_1.default.info(`Current URL: ${currentUrl}`);
                throw new Error('Manufacturers list not found. See screenshot for details.');
            }
            // Rest of the code proceeds as before...
            // Scrape car manufacturers
            const manufacturers = await scrapeOptions(page, 'div.all-make__item-text');
            logger_1.default.info(`Found ${manufacturers.length} car manufacturers`);
            // Present manufacturers to user and get selection
            const selectedMake = await promptUser('Select car manufacturer', manufacturers);
            logger_1.default.info(`User selected manufacturer: ${selectedMake}`);
            // Find and click the selected manufacturer
            const manufacturerSelector = await page.evaluateHandle((make) => {
                const divs = document.querySelectorAll('div.all-make__item-text');
                for (const div of divs) {
                    if (div.textContent?.trim() === make) {
                        return div.parentElement;
                    }
                }
                return null;
            }, selectedMake);
            if (manufacturerSelector) {
                await manufacturerSelector.click();
                logger_1.default.info(`Clicked on manufacturer: ${selectedMake}`);
            }
            else {
                throw new Error(`Could not find manufacturer: ${selectedMake}`);
            }
            // Step 2: Get and present car models
            logger_1.default.info('Looking for See All Cars button');
            await page.screenshot({ path: 'before-models.png' });
            // Wait for page to load after manufacturer selection
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Try to find the "See All XX Cars" button with a flexible selector
            let modelsButtonClicked = false;
            try {
                // Look for button using a partial text match approach
                const seeAllCarsButton = await page.evaluateHandle(() => {
                    // This finds any button/link containing "See all" and "Cars" in its text
                    const elements = Array.from(document.querySelectorAll('button, a, .w--button'));
                    const button = elements.find(el => {
                        const text = el.textContent?.trim().toLowerCase() || '';
                        return text.includes('see all') && text.includes('cars');
                    });
                    console.log('Found button with text:', button?.textContent);
                    return button || null;
                });
                if (seeAllCarsButton) {
                    // Check if the handle is not null before trying to use it
                    const element = await seeAllCarsButton.asElement();
                    if (element) {
                        // Cast the element handle to ElementHandle<Element> before clicking
                        await element.click();
                        logger_1.default.info('Clicked on "See All Cars" button');
                        modelsButtonClicked = true;
                        // Wait for the models to load after clicking
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                    else {
                        logger_1.default.warn('Could not find "See All Cars" button - handle did not resolve to an element');
                    }
                }
                else {
                    logger_1.default.warn('Could not find "See All Cars" button using element search');
                }
            }
            catch (error) {
                logger_1.default.error(`Error finding/clicking "See All Cars" button: ${error.message}`);
            }
            // If button wasn't clicked, try alternative selectors
            if (!modelsButtonClicked) {
                // First, check specifically for top-models container
                logger_1.default.info('Checking for top-models container');
                const topModelsExists = await page.evaluate(() => {
                    return document.querySelector('.top-models') !== null;
                });
                if (topModelsExists) {
                    logger_1.default.info('Found top-models container - using this for model selection');
                    await page.screenshot({ path: 'top-models-found.png' });
                    // Extract models from the top-models container
                    const topModels = await scrapeOptions(page, '.top-models__item span');
                    logger_1.default.info(`Found ${topModels.length} models in top-models container: ${topModels.join(', ')}`);
                    // Present models to user and get selection
                    const selectedModel = await promptUser('Select car model', topModels);
                    logger_1.default.info(`User selected model: ${selectedModel}`);
                    // Find and click the selected model
                    const clicked = await page.evaluate((modelName) => {
                        const spans = document.querySelectorAll('.top-models__item span');
                        for (const span of spans) {
                            if (span.textContent?.trim() === modelName) {
                                span.closest('.top-models__item').click();
                                return true;
                            }
                        }
                        return false;
                    }, selectedModel);
                    if (clicked) {
                        logger_1.default.info(`Clicked on model: ${selectedModel} from top-models container`);
                        modelsButtonClicked = true; // Set this to skip other selectors
                    }
                    else {
                        logger_1.default.error(`Failed to click on model: ${selectedModel} from top-models container`);
                    }
                }
                // If top-models approach didn't work, continue with the existing alternative selectors
                if (!modelsButtonClicked) {
                    const possibleSelectors = [
                        'button.w--button--all-models',
                        'a.w--button--all-models',
                        'a.w--button.w--button--empty.w--button--all-models',
                        'a[class*="all-models"]',
                        'button[class*="all-models"]',
                        '.all-models-button'
                    ];
                    for (const selector of possibleSelectors) {
                        try {
                            logger_1.default.info(`Trying selector: ${selector}`);
                            const exists = await page.evaluate((sel) => {
                                const element = document.querySelector(sel);
                                return !!element;
                            }, selector);
                            if (exists) {
                                await page.click(selector);
                                logger_1.default.info(`Clicked on models button using selector: ${selector}`);
                                modelsButtonClicked = true;
                                // Wait for the models to load
                                await new Promise(resolve => setTimeout(resolve, 2000));
                                break;
                            }
                        }
                        catch (error) {
                            logger_1.default.warn(`Failed with selector ${selector}: ${error.message}`);
                        }
                    }
                }
            }
            // Take a screenshot to see what we have now
            await page.screenshot({ path: 'after-models-button.png' });
            // Look for models - try different selectors based on whether button was clicked
            let modelSelector;
            if (modelsButtonClicked) {
                modelSelector = 'div.all-models__item-text'; // If button was clicked, use this
            }
            else {
                modelSelector = 'div.car-card-new__title, .car-model'; // If button wasn't clicked, use these alternatives
            }
            // Try to find any available car models on the page
            const modelElements = await page.evaluate((selector) => {
                const elements = document.querySelectorAll(selector);
                return elements.length;
            }, modelSelector);
            // If no models found with primary selector, try multiple alternative selectors
            if (modelElements === 0) {
                logger_1.default.warn(`No models found with selector: ${modelSelector}. Trying alternatives...`);
                const alternativeSelectors = [
                    // Popular selector variations for car models
                    '.car-card-new__title',
                    '.car-model',
                    '.car-name',
                    '.model-name',
                    '.model-card',
                    '.model-card-name',
                    '.car-model-title',
                    '.car-model-name'
                ];
                for (const selector of alternativeSelectors) {
                    const count = await page.evaluate((sel) => {
                        return document.querySelectorAll(sel).length;
                    }, selector);
                    if (count > 0) {
                        logger_1.default.info(`Found ${count} models with alternative selector: ${selector}`);
                        modelSelector = selector;
                        break;
                    }
                }
            }
            // Scrape car models with the best selector we found
            const models = await scrapeOptions(page, modelSelector);
            logger_1.default.info(`Found ${models.length} car models: ${models.join(', ')}`);
            // If we still don't have models, search more broadly for anything that might be a model
            if (models.length === 0) {
                logger_1.default.warn('No models found with any specific selectors. Looking for any clickable elements...');
                // Get all clickable elements that might be car models
                const possibleModels = await page.evaluate(() => {
                    // Get all elements that look like they might be clickable model options
                    const elements = document.querySelectorAll('a, button, div[role="button"], .clickable, div[class*="car"], div[class*="model"]');
                    return Array.from(elements)
                        .filter(el => {
                        const text = el.textContent?.trim() || '';
                        // Filter out elements with no text or that look like navigation/buttons
                        return text.length > 0 &&
                            !text.toLowerCase().includes('see all') &&
                            !text.toLowerCase().includes('search') &&
                            !text.toLowerCase().includes('next') &&
                            !text.toLowerCase().includes('previous');
                    })
                        .map(el => el.textContent?.trim() || '')
                        .filter((text, index, self) => self.indexOf(text) === index); // Remove duplicates
                });
                logger_1.default.info(`Found ${possibleModels.length} possible model elements on page`);
                if (possibleModels.length > 0) {
                    // Use these as our models
                    const filteredModels = possibleModels.filter(m => m.length > 0 && m.length < 30); // Avoid very long strings
                    logger_1.default.info(`Using ${filteredModels.length} possible models: ${filteredModels.join(', ')}`);
                    // Present models to user and get selection
                    const selectedModel = await promptUser('Select car model', filteredModels);
                    logger_1.default.info(`User selected model: ${selectedModel}`);
                    // Click the selected model by text search
                    await page.evaluate((modelText) => {
                        const elements = document.querySelectorAll('a, button, div[role="button"], .clickable, div[class*="car"], div[class*="model"]');
                        for (const el of elements) {
                            if (el.textContent?.trim() === modelText) {
                                el.click();
                                return true;
                            }
                        }
                        return false;
                    }, selectedModel);
                    logger_1.default.info(`Clicked on model by text search: ${selectedModel}`);
                }
                else {
                    throw new Error('No car models found on the page. Cannot proceed.');
                }
            }
            else {
                // Present models to user and get selection
                const selectedModel = await promptUser('Select car model', models);
                logger_1.default.info(`User selected model: ${selectedModel}`);
                // Find and click the selected model
                const modelSelectorHandle = await page.evaluateHandle((model, selector) => {
                    const elements = document.querySelectorAll(selector);
                    for (const el of elements) {
                        if (el.textContent?.trim() === model) {
                            return el.closest('div.all-models__item') || el.closest('div.car-card-new') || el.closest('a') || el.parentElement;
                        }
                    }
                    return null;
                }, selectedModel, modelSelector);
                if (modelSelectorHandle) {
                    // Check if the handle is not null before trying to use it
                    const element = await modelSelectorHandle.asElement();
                    if (element) {
                        // Cast the element handle to ElementHandle<Element> before clicking
                        await element.click();
                        logger_1.default.info(`Clicked on model: ${selectedModel}`);
                    }
                    else {
                        // Try finding and clicking by text if selector approach fails
                        const clicked = await page.evaluate((modelText) => {
                            const elements = document.querySelectorAll('*');
                            for (const el of elements) {
                                if (el.textContent?.trim() === modelText) {
                                    el.click();
                                    return true;
                                }
                            }
                            return false;
                        }, selectedModel);
                        if (clicked) {
                            logger_1.default.info(`Clicked on model by text content: ${selectedModel}`);
                        }
                        else {
                            throw new Error(`Could not find model: ${selectedModel}`);
                        }
                    }
                }
                else {
                    // Same fallback as above
                    const clicked = await page.evaluate((modelText) => {
                        const elements = document.querySelectorAll('*');
                        for (const el of elements) {
                            if (el.textContent?.trim() === modelText) {
                                el.click();
                                return true;
                            }
                        }
                        return false;
                    }, selectedModel);
                    if (clicked) {
                        logger_1.default.info(`Clicked on model by text content: ${selectedModel}`);
                    }
                    else {
                        throw new Error(`Could not find model: ${selectedModel}`);
                    }
                }
            }
            // Step 3: Fuel type
            await page.waitForSelector('ul.fuel-selector__list > li');
            // Scrape fuel types
            const fuelTypes = await scrapeOptions(page, 'ul.fuel-selector__list > li');
            logger_1.default.info(`Found ${fuelTypes.length} fuel types`);
            // Present fuel types to user and get selection
            const selectedFuelType = await promptUser('Select fuel type', fuelTypes);
            logger_1.default.info(`User selected fuel type: ${selectedFuelType}`);
            // Find and click the selected fuel type
            const fuelTypeSelector = await page.evaluateHandle((fuelType) => {
                const items = document.querySelectorAll('ul.fuel-selector__list > li');
                for (const item of items) {
                    if (item.textContent?.trim() === fuelType) {
                        return item;
                    }
                }
                return null;
            }, selectedFuelType);
            if (fuelTypeSelector) {
                await fuelTypeSelector.click();
                logger_1.default.info(`Clicked on fuel type: ${selectedFuelType}`);
            }
            else {
                throw new Error(`Could not find fuel type: ${selectedFuelType}`);
            }
            // Step 4: Car Variant Selection - Modified to support alternative list format
            logger_1.default.info('Waiting for variant selection to load');
            let variantSelectionWorked = false;
            // First try the dropdown style variant selection
            try {
                await page.waitForSelector('.w--multi_select_dd', { timeout: 10000 });
                // Click on the variant dropdown to open it
                await page.click('.w--multi_select_handle');
                logger_1.default.info('Clicked on variant dropdown');
                // Wait for the variant options to load
                await page.waitForSelector('.w--multi_select_dd_element');
                await page.screenshot({ path: 'variants-dropdown.png' });
                // Scrape all variants directly from the dropdown
                const variants = await page.evaluate(() => {
                    const elements = document.querySelectorAll('.w--multi_select_dd_element');
                    return Array.from(elements)
                        .map(el => el.textContent?.trim() || '')
                        .filter(text => text.length > 0);
                });
                logger_1.default.info(`Found ${variants.length} variant options in dropdown`);
                if (variants.length > 0) {
                    // Present variants to user and get selection
                    const selectedVariant = await promptUser('Select your car variant', variants);
                    logger_1.default.info(`User selected variant: ${selectedVariant}`);
                    // Click on the selected variant directly
                    await page.evaluate((variantText) => {
                        const elements = document.querySelectorAll('.w--multi_select_dd_element');
                        for (const el of elements) {
                            if (el.textContent?.trim() === variantText) {
                                el.click();
                                return true;
                            }
                        }
                        return false;
                    }, selectedVariant);
                    logger_1.default.info(`Selected variant: ${selectedVariant}`);
                    variantSelectionWorked = true;
                }
            }
            catch (error) {
                logger_1.default.warn(`Dropdown variant selection failed: ${error.message}`);
                // Continue to alternative method
            }
            // If dropdown selection didn't work, try the alternative variants-list structure
            if (!variantSelectionWorked) {
                logger_1.default.info('Trying alternative variants-list structure');
                try {
                    // Check if variants-list exists
                    const variantsListExists = await page.evaluate(() => {
                        return document.querySelector('.variants-list') !== null;
                    });
                    if (variantsListExists) {
                        logger_1.default.info('Found variants-list structure');
                        await page.screenshot({ path: 'variants-list.png' });
                        // Scrape variants from this alternative structure
                        const variants = await page.evaluate(() => {
                            const elements = document.querySelectorAll('.variants-list__item span');
                            return Array.from(elements)
                                .map(el => el.textContent?.trim() || '')
                                .filter(text => text.length > 0);
                        });
                        logger_1.default.info(`Found ${variants.length} variants in variants-list: ${variants.join(', ')}`);
                        if (variants.length > 0) {
                            // Present variants to user and get selection
                            const selectedVariant = await promptUser('Select your car variant', variants);
                            logger_1.default.info(`User selected variant: ${selectedVariant}`);
                            // Click the selected variant
                            const clicked = await page.evaluate((variantText) => {
                                const spans = document.querySelectorAll('.variants-list__item span');
                                for (const span of spans) {
                                    if (span.textContent?.trim() === variantText) {
                                        span.closest('.variants-list__item').click();
                                        return true;
                                    }
                                }
                                return false;
                            }, selectedVariant);
                            if (clicked) {
                                logger_1.default.info(`Clicked variant: ${selectedVariant} from variants-list`);
                                variantSelectionWorked = true;
                            }
                            else {
                                logger_1.default.error(`Failed to click variant: ${selectedVariant} in variants-list`);
                            }
                        }
                    }
                    else {
                        logger_1.default.warn('Alternative variants-list structure not found');
                    }
                }
                catch (error) {
                    logger_1.default.error(`Alternative variant selection failed: ${error.message}`);
                }
            }
            // If both methods failed, throw an error
            if (!variantSelectionWorked) {
                logger_1.default.error('Failed to select a variant using either method');
                await page.screenshot({ path: 'variant-selection-failed.png' });
                throw new Error('Could not select a variant using any available method');
            }
            // Same approach for registration place selection
            logger_1.default.info('Waiting for registration place selection to load');
            await page.waitForSelector('.wizard-content-wrapper.fallback-registry');
            // Click on the registration place dropdown to open it
            await page.click('.w--multi_select_handle');
            logger_1.default.info('Clicked on registration place dropdown');
            // Wait for the options to load
            await page.waitForSelector('.w--multi_select_dd_element');
            await page.screenshot({ path: 'registration-dropdown.png' });
            // Scrape all registration places
            const regPlaces = await page.evaluate(() => {
                const elements = document.querySelectorAll('.w--multi_select_dd_element');
                return Array.from(elements)
                    .map(el => el.textContent?.trim() || '')
                    .filter(text => text.length > 0);
            });
            logger_1.default.info(`Found ${regPlaces.length} registration places`);
            // Ask user for a search term
            const regSearchTerm = await promptUser('Enter your city name or RTO code (e.g. "Mumbai" or "MH-01")');
            logger_1.default.info(`User is searching for: ${regSearchTerm}`);
            // Filter the list based on user's search term
            const filteredRegPlaces = regPlaces.filter(place => place.toLowerCase().includes(regSearchTerm.toLowerCase()));
            // Show a manageable number of results
            const displayRegPlaces = filteredRegPlaces.length > 0 ?
                filteredRegPlaces.slice(0, 20) : regPlaces.slice(0, 20);
            // Present filtered registration places to user
            const selectedRegPlace = await promptUser('Select your registration place', displayRegPlaces);
            logger_1.default.info(`User selected registration place: ${selectedRegPlace}`);
            // Click on the selected registration place
            await page.evaluate((placeText) => {
                const elements = document.querySelectorAll('.w--multi_select_dd_element');
                for (const el of elements) {
                    if (el.textContent?.trim() === placeText) {
                        el.click();
                        return true;
                    }
                }
                return false;
            }, selectedRegPlace);
            // After selecting registration place, handle the registration year selection
            logger_1.default.info('Checking for registration year selection after registration place...');
            await page.screenshot({ path: 'after-registration-place.png' });
            // Wait a bit for any transitions to complete
            await new Promise(resolve => setTimeout(resolve, 3000));
            // Look for registration year dropdown
            const hasYearDropdown = await page.evaluate(() => {
                // Check for dropdown with year values (20XX)
                const yearDropdown = document.querySelector('.w--multi_select_handle');
                const yearPlaceholder = document.querySelector('.dd_placeholder');
                return yearDropdown !== null &&
                    yearPlaceholder !== null &&
                    yearPlaceholder.textContent?.includes('20');
            });
            if (hasYearDropdown) {
                logger_1.default.info('Registration year dropdown found');
                // Click to open the dropdown
                await page.click('.w--multi_select_handle');
                logger_1.default.info('Clicked to open year dropdown');
                // Wait for the dropdown to appear
                await page.waitForSelector('.w--multi_select_dd_element', { timeout: 5000 });
                await page.screenshot({ path: 'year-dropdown-open.png' });
                // Scrape available years
                const years = await page.evaluate(() => {
                    const elements = document.querySelectorAll('.w--multi_select_dd_element');
                    return Array.from(elements)
                        .map(el => el.textContent?.trim() || '')
                        .filter(text => text.length > 0);
                });
                logger_1.default.info(`Found ${years.length} registration year options: ${years.join(', ')}`);
                // Present years to user and get selection
                const selectedYear = await promptUser('Select registration year', years);
                logger_1.default.info(`User selected registration year: ${selectedYear}`);
                // Try search box first if available
                const hasSearchBox = await page.evaluate(() => {
                    return document.querySelector('#SearchBox.search-box') !== null;
                });
                if (hasSearchBox) {
                    logger_1.default.info('Using search box to find year');
                    await page.type('#SearchBox.search-box', selectedYear);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    // Click the filtered year option
                    const yearClicked = await page.evaluate((year) => {
                        const elements = document.querySelectorAll('.w--multi_select_dd_element');
                        for (const el of elements) {
                            if (el.textContent?.trim() === year) {
                                el.click();
                                return true;
                            }
                        }
                        return false;
                    }, selectedYear);
                    if (yearClicked) {
                        logger_1.default.info(`Clicked on year ${selectedYear} using search`);
                    }
                    else {
                        logger_1.default.warn(`Could not find year ${selectedYear} after search, trying direct selection`);
                        // Try direct selection
                        await page.evaluate((year) => {
                            const elements = document.querySelectorAll('.w--multi_select_dd_element');
                            for (const el of elements) {
                                if (el.textContent?.trim() === year) {
                                    el.click();
                                }
                            }
                        }, selectedYear);
                        logger_1.default.info(`Attempted direct selection of year ${selectedYear}`);
                    }
                }
                else {
                    // Direct selection without search
                    await page.evaluate((year) => {
                        const elements = document.querySelectorAll('.w--multi_select_dd_element');
                        for (const el of elements) {
                            if (el.textContent?.trim() === year) {
                                el.click();
                            }
                        }
                    }, selectedYear);
                    logger_1.default.info(`Selected year ${selectedYear} directly`);
                }
                // Allow page to transition
                await new Promise(resolve => setTimeout(resolve, 3000));
                await page.screenshot({ path: 'after-year-selection.png' });
            }
            else {
                // Check for Save & Continue button
                const hasSaveButton = await page.evaluate(() => {
                    return document.querySelector('button.w--button--fb-registration') !== null;
                });
                if (hasSaveButton) {
                    logger_1.default.info('Registration year not needed, but Save & Continue button found');
                    await page.click('button.w--button--fb-registration');
                    logger_1.default.info('Clicked Save & Continue button');
                    // Allow page to transition
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    await page.screenshot({ path: 'after-save-continue.png' });
                }
                else {
                    logger_1.default.info('No registration year dropdown or Save & Continue button found, continuing with workflow');
                }
            }
            // After selecting "Not Expired" option
            await page.click('.w--radio--fl-expiry .w--radio__options .w--radio__option:first-child');
            logger_1.default.info('Selected "Not Expired" option');
            // Take a screenshot after selection
            await page.screenshot({ path: 'after-expiry-selection.png' });
            // Wait for the claim question to appear
            try {
                await page.waitForSelector('.claim-mopro .w--radio--claim', { timeout: 10000 });
                logger_1.default.info('Claim question found for new car flow');
                // Take screenshot before claim selection
                await page.screenshot({ path: 'before-claim-selection-newcar.png' });
                // Select claim status based on request parameter
                if (request.hasMadeClaim) {
                    logger_1.default.info('Setting claim status as Yes for new car');
                    // Try multiple approaches to click the "Yes" option
                    try {
                        // First try: Use text content
                        const yesClicked = await page.evaluate(() => {
                            const options = Array.from(document.querySelectorAll('.claim-mopro .w--radio--claim .w--radio__options .w--radio__option'));
                            const yesOption = options.find(opt => opt.textContent?.toLowerCase().includes('yes'));
                            if (yesOption) {
                                yesOption.click();
                                return true;
                            }
                            return false;
                        });
                        if (!yesClicked) {
                            // Second try: Use first child
                            await page.click('.claim-mopro .w--radio--claim .w--radio__options .w--radio__option:nth-child(1)');
                        }
                        logger_1.default.info('Successfully clicked Yes for claim in new car flow');
                    }
                    catch (error) {
                        logger_1.default.error(`Failed to click Yes for claim in new car flow: ${error.message}`);
                        await page.screenshot({ path: 'claim-yes-failure-newcar.png' });
                    }
                }
                else {
                    logger_1.default.info('Setting claim status as No for new car');
                    // Try multiple approaches to click the "No" option
                    try {
                        // First try: Use text content
                        const noClicked = await page.evaluate(() => {
                            const options = Array.from(document.querySelectorAll('.claim-mopro .w--radio--claim .w--radio__options .w--radio__option'));
                            const noOption = options.find(opt => opt.textContent?.toLowerCase().includes('no') &&
                                !opt.textContent?.toLowerCase().includes("don't know"));
                            if (noOption) {
                                noOption.click();
                                return true;
                            }
                            return false;
                        });
                        if (!noClicked) {
                            // Second try: Use second child (which should be "No")
                            await page.click('.claim-mopro .w--radio--claim .w--radio__options .w--radio__option:nth-child(2)');
                        }
                        logger_1.default.info('Successfully clicked No for claim in new car flow');
                    }
                    catch (error) {
                        logger_1.default.error(`Failed to click No for claim in new car flow: ${error.message}`);
                        await page.screenshot({ path: 'claim-no-failure-newcar.png' });
                    }
                }
                // Wait a bit for the claim selection to register
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            catch (error) {
                logger_1.default.warn(`Claim selection section not found in new car flow: ${error.message}`);
                logger_1.default.info('Continuing without claim selection as it might be optional');
                await page.screenshot({ path: 'claim-section-not-found-newcar.png' });
            }
            // Wait for the phone number field to appear
            await page.waitForSelector('input[type="tel"]', { timeout: 10000 });
            logger_1.default.info('Phone number field found');
            // After registration year selection for new cars, handle the policy expiry section
            if (request.isNewCar) {
                try {
                    logger_1.default.info('Checking for policy expiry section after registration year...');
                    // Take a screenshot to see current state
                    await page.screenshot({ path: 'before-policy-expiry.png' });
                    // Wait for the policy expiry section to appear
                    await page.waitForSelector('.w--radio--fl-expiry', { timeout: 15000 });
                    logger_1.default.info('Policy expiry section found for new car flow');
                    // Select the "Not Expired" option
                    await page.click('.w--radio--fl-expiry .w--radio__options .w--radio__option:first-child');
                    logger_1.default.info('Selected "Not Expired" option');
                    // Take a screenshot after selection
                    await page.screenshot({ path: 'after-expiry-selection.png' });
                    // Wait for the phone number field to appear
                    await page.waitForSelector('input[type="tel"]', { timeout: 10000 });
                    logger_1.default.info('Phone number field found');
                    // Fill in the phone number
                    await page.type('input[type="tel"]', request.phoneNumber);
                    logger_1.default.info(`Filled in phone number: ${request.phoneNumber}`);
                    // Take a screenshot before clicking View Quotes
                    await page.screenshot({ path: 'before-view-quotes-newcar.png' });
                    // Find and click the "View Quotes" button
                    const viewQuotesButtonSelectors = [
                        '.w--button.dls-view-quotes-btn',
                        'button.w--button--orange',
                        'button:contains("View Quotes")',
                        '.w--button:contains("View Quotes")'
                    ];
                    let quotesButtonClicked = false;
                    for (const selector of viewQuotesButtonSelectors) {
                        try {
                            const exists = await page.evaluate((sel) => {
                                return document.querySelector(sel) !== null;
                            }, selector);
                            if (exists) {
                                await page.waitForSelector(selector, { timeout: 5000 });
                                await page.click(selector);
                                logger_1.default.info(`Clicked "View Quotes" button using selector: ${selector}`);
                                quotesButtonClicked = true;
                                break;
                            }
                        }
                        catch (error) {
                            logger_1.default.warn(`View Quotes button selector ${selector} failed: ${error.message}`);
                        }
                    }
                    if (!quotesButtonClicked) {
                        // Try to find the button by text content
                        quotesButtonClicked = await page.evaluate(() => {
                            const buttons = document.querySelectorAll('button, a, .w--button, [role="button"]');
                            for (const button of buttons) {
                                const text = button.textContent?.toLowerCase() || '';
                                if (text.includes('view') && text.includes('quote')) {
                                    button.click();
                                    console.log('Clicked button with text:', button.textContent);
                                    return true;
                                }
                            }
                            return false;
                        });
                        if (quotesButtonClicked) {
                            logger_1.default.info('Clicked "View Quotes" button using text search');
                        }
                        else {
                            logger_1.default.warn('Could not find "View Quotes" button with any selector');
                        }
                    }
                    // Wait longer for the quotes page to load after clicking
                    await new Promise(resolve => setTimeout(resolve, 8000));
                }
                catch (error) {
                    logger_1.default.error(`Error handling policy expiry section: ${error.message}`);
                    logger_1.default.info('Continuing anyway as this section might be optional in some flows');
                    // Take a screenshot of the error state
                    await page.screenshot({ path: 'policy-expiry-error.png' });
                }
            }
            // Wait for quotes to load with improved selectors and longer timeout
            logger_1.default.info('Waiting for quotes to load after flow completion...');
        }
        else {
            // ===== EXISTING CAR FLOW =====
            logger_1.default.info(`Starting existing car flow for registration: ${request.registrationNumber}`);
            // Fill registration number
            await page.waitForSelector('input[type="text"][maxlength="15"]');
            await page.click('input[type="text"][maxlength="15"]');
            if (request.registrationNumber) {
                await page.type('input[type="text"][maxlength="15"]', request.registrationNumber);
                logger_1.default.info(`Entered registration number: ${request.registrationNumber}`);
            }
            else {
                logger_1.default.warn('No registration number provided for existing car flow');
            }
            // Fill phone number
            await page.waitForSelector('.w--text_input-mobile input[type="tel"]');
            await page.click('.w--text_input-mobile input[type="tel"]');
            await page.type('.w--text_input-mobile input[type="tel"]', request.phoneNumber);
            logger_1.default.info(`Filled phone number: ${request.phoneNumber}`);
            // Take screenshot before clicking view quotes button
            await page.screenshot({ path: 'before-view-quotes.png' });
            // Click view quotes button
            await page.waitForSelector('.w--button.dls-view-quotes-btn');
            await page.click('.w--button.dls-view-quotes-btn');
            logger_1.default.info('Clicked view quotes button');
            // Wait for the confirmation screen with a longer timeout
            logger_1.default.info('Waiting for confirmation screen...');
            try {
                await page.waitForSelector('.fl-confirmation-wrapper', { timeout: 20000 });
                logger_1.default.info('Confirmation screen loaded successfully');
                // Take screenshot of confirmation screen
                await page.screenshot({ path: 'confirmation-screen.png' });
                // Set policy expiration based on request
                if (request.isPolicyExpired) {
                    logger_1.default.info('Setting policy as Expired');
                    // Try multiple approaches to click the "Expired" option
                    try {
                        // First try: Use text content if available
                        const expiredClicked = await page.evaluate(() => {
                            const options = Array.from(document.querySelectorAll('.w--radio--fl-expiry .w--radio__options .w--radio__option'));
                            const expiredOption = options.find(opt => opt.textContent?.toLowerCase().includes('expired') &&
                                !opt.textContent?.toLowerCase().includes('not expired'));
                            if (expiredOption) {
                                expiredOption.click();
                                return true;
                            }
                            return false;
                        });
                        if (!expiredClicked) {
                            // Second try: Use second child if text approach fails
                            await page.click('.w--radio--fl-expiry .w--radio__options .w--radio__option:nth-child(2)');
                        }
                        logger_1.default.info('Successfully clicked Expired option');
                    }
                    catch (error) {
                        logger_1.default.error(`Failed to click Expired option: ${error.message}`);
                        // Take screenshot of the failure
                        await page.screenshot({ path: 'expired-click-failure.png' });
                    }
                }
                else {
                    logger_1.default.info('Setting policy as Not Expired');
                    // Try multiple approaches to click the "Not Expired" option
                    try {
                        // First try: Use text content if available
                        const notExpiredClicked = await page.evaluate(() => {
                            const options = Array.from(document.querySelectorAll('.w--radio--fl-expiry .w--radio__options .w--radio__option'));
                            const notExpiredOption = options.find(opt => opt.textContent?.toLowerCase().includes('not expired'));
                            if (notExpiredOption) {
                                notExpiredOption.click();
                                return true;
                            }
                            return false;
                        });
                        if (!notExpiredClicked) {
                            // Second try: Use first child if text approach fails
                            await page.click('.w--radio--fl-expiry .w--radio__options .w--radio__option:nth-child(1)');
                        }
                        logger_1.default.info('Successfully clicked Not Expired option');
                    }
                    catch (error) {
                        logger_1.default.error(`Failed to click Not Expired option: ${error.message}`);
                        // Take screenshot of the failure
                        await page.screenshot({ path: 'not-expired-click-failure.png' });
                    }
                }
                // Wait a bit for the expiry selection to register
                await new Promise(resolve => setTimeout(resolve, 1000));
                // Wait for claim section to appear
                await page.waitForSelector('.claim-mopro .w--radio--claim', { timeout: 10000 });
                logger_1.default.info('Claim section found');
                // Take screenshot before claim selection
                await page.screenshot({ path: 'before-claim-selection.png' });
                // Set claim status based on request
                if (request.hasMadeClaim) {
                    logger_1.default.info('Setting claim status as Yes');
                    // Try multiple approaches to click the "Yes" option
                    try {
                        // First try: Use text content
                        const yesClicked = await page.evaluate(() => {
                            const options = Array.from(document.querySelectorAll('.claim-mopro .w--radio--claim .w--radio__options .w--radio__option'));
                            const yesOption = options.find(opt => opt.textContent?.toLowerCase().includes('yes'));
                            if (yesOption) {
                                yesOption.click();
                                return true;
                            }
                            return false;
                        });
                        if (!yesClicked) {
                            // Second try: Use first child
                            await page.click('.claim-mopro .w--radio--claim .w--radio__options .w--radio__option:nth-child(1)');
                        }
                        logger_1.default.info('Successfully clicked Yes for claim');
                    }
                    catch (error) {
                        logger_1.default.error(`Failed to click Yes for claim: ${error.message}`);
                        await page.screenshot({ path: 'claim-yes-failure.png' });
                    }
                }
                else {
                    logger_1.default.info('Setting claim status as No');
                    // Try multiple approaches to click the "No" option
                    try {
                        // First try: Use text content
                        const noClicked = await page.evaluate(() => {
                            const options = Array.from(document.querySelectorAll('.claim-mopro .w--radio--claim .w--radio__options .w--radio__option'));
                            const noOption = options.find(opt => opt.textContent?.toLowerCase().includes('no'));
                            if (noOption) {
                                noOption.click();
                                return true;
                            }
                            return false;
                        });
                        if (!noClicked) {
                            // Second try: Use second child
                            await page.click('.claim-mopro .w--radio--claim .w--radio__options .w--radio__option:nth-child(2)');
                        }
                        logger_1.default.info('Successfully clicked No for claim');
                    }
                    catch (error) {
                        logger_1.default.error(`Failed to click No for claim: ${error.message}`);
                        await page.screenshot({ path: 'claim-no-failure.png' });
                    }
                }
                // Wait a bit for the claim selection to register
                await new Promise(resolve => setTimeout(resolve, 1000));
                // Take screenshot before clicking continue
                await page.screenshot({ path: 'before-continue-click.png' });
                // Wait for and click the continue button
                await page.waitForSelector('.w--button.w--button--fl-vq.w--button--orange', { timeout: 5000 });
                await page.click('.w--button.w--button--fl-vq.w--button--orange');
                logger_1.default.info('Clicked continue button');
            }
            catch (error) {
                logger_1.default.warn(`Confirmation screen not found: ${error.message}`);
                logger_1.default.info('Continuing with quotes page directly as confirmation screen may be skipped sometimes');
            }
        }
        // Wait for quotes to load with improved selectors and longer timeout
        logger_1.default.info('Waiting for quotes to load after flow completion...');
        try {
            // Increase timeout and use more selector variations to handle different page structures
            await page.waitForSelector('.plan-card-container, .pcc__card, .result-cards, .quote-card', { timeout: 30000 });
            logger_1.default.info('Quotes container found, extracting data...');
            // Take a screenshot of the results page
            await page.screenshot({ path: 'quotes-page.png' });
            // Wait a bit longer to ensure all dynamic content is fully loaded
            await new Promise(resolve => setTimeout(resolve, 5000));
            // Extract basic quote data with improved selector handling
            const basicQuotes = await page.evaluate(() => {
                const quoteData = [];
                // Get all quote cards with multiple selector options to handle both flows
                const cards = document.querySelectorAll('.pcc__card, .plan-card-container > div, .result-cards > div');
                console.log('Found ' + cards.length + ' quote cards');
                cards.forEach((card, index) => {
                    // Try multiple selector patterns for each piece of information
                    // This handles differences between new car and existing car flows
                    // Extract insurer name
                    let insurer = card.querySelector('.insurer-name')?.textContent?.trim() ||
                        card.querySelector('[class*="insurer-name"]')?.textContent?.trim() ||
                        card.querySelector('[class*="company-name"]')?.textContent?.trim() || 'Unknown';
                    // Extract price
                    let price = card.querySelector('.premium-value')?.textContent?.trim() ||
                        card.querySelector('.pcb__price__rs span span:last-child')?.textContent?.trim() ||
                        card.querySelector('[class*="premium"]')?.textContent?.trim() || 'N/A';
                    // Extract IDV
                    let idv = card.querySelector('.idv-value')?.textContent?.trim() ||
                        card.querySelector('[class*="idv"]')?.textContent?.trim() ||
                        card.querySelector('.cover-value')?.textContent?.trim() || 'N/A';
                    // Extract plan type
                    let planType = card.querySelector('.plan-type')?.textContent?.trim() ||
                        card.querySelector('[class*="plan-type"]')?.textContent?.trim() || 'Standard';
                    // Extract logo URL
                    let logoUrl = card.querySelector('.insurer-logo img')?.getAttribute('src') ||
                        card.querySelector('[class*="logo"] img')?.getAttribute('src') || '';
                    quoteData.push({
                        index,
                        insurer,
                        price,
                        idv,
                        planType,
                        logoUrl
                    });
                });
                return quoteData;
            });
            logger_1.default.info(`Basic data extraction complete. Found ${basicQuotes.length} quotes.`);
            // Process detailed information
            const enhancedQuotes = [];
            // Process each quote to get detailed information
            for (let i = 0; i < basicQuotes.length; i++) {
                const quote = basicQuotes[i];
                logger_1.default.info(`Processing details for quote ${i + 1} (${quote.insurer})`);
                try {
                    // Try multiple selector patterns for the Plan Details button
                    const planDetailSelectors = [
                        `.pcc__card:nth-child(${i + 1}) .pcc__card__plancash .pcp__left`,
                        `.pcc__card:nth-child(${i + 1}) [data-v-c33ef8bc].pcc__card__plancash span.pcp__left`,
                        `.pcc__card:nth-child(${i + 1}) [class*="plan-details"]`,
                        `.pcc__card:nth-child(${i + 1}) [class*="view-details"]`,
                        `.plan-card-container > div:nth-child(${i + 1}) [class*="details"]`,
                        `.result-cards > div:nth-child(${i + 1}) [class*="details"]`
                    ];
                    // Try each selector until one works
                    let detailsClicked = false;
                    for (const selector of planDetailSelectors) {
                        try {
                            const exists = await page.evaluate((sel) => {
                                return document.querySelector(sel) !== null;
                            }, selector);
                            if (exists) {
                                await page.waitForSelector(selector, { timeout: 5000 });
                                await page.click(selector);
                                logger_1.default.info(`Clicked plan details using selector: ${selector}`);
                                detailsClicked = true;
                                break;
                            }
                        }
                        catch (error) {
                            logger_1.default.warn(`Selector ${selector} failed: ${error.message}`);
                        }
                    }
                    if (!detailsClicked) {
                        // Last resort: Try to find any "details" or "plan" button within this card
                        detailsClicked = await page.evaluate((index) => {
                            // Get the card element
                            const card = document.querySelectorAll('.pcc__card, .plan-card-container > div, .result-cards > div')[index];
                            if (!card)
                                return false;
                            // Look for anything that might be a details button
                            const detailsElements = card.querySelectorAll('a, button, [role="button"], div, span');
                            for (const el of detailsElements) {
                                const text = el.textContent?.toLowerCase() || '';
                                if (text.includes('detail') || text.includes('plan') || text.includes('view')) {
                                    el.click();
                                    console.log('Clicked element with text:', text);
                                    return true;
                                }
                            }
                            return false;
                        }, i);
                        if (detailsClicked) {
                            logger_1.default.info(`Clicked plan details using text search for quote ${i + 1}`);
                        }
                        else {
                            throw new Error(`Could not find or click plan details button for quote ${i + 1}`);
                        }
                    }
                    // Wait for the popup to appear with multiple selectors
                    await page.waitForSelector('div.cf-modal__content, .modal-content, [class*="modal"], [role="dialog"]', { timeout: 10000 });
                    logger_1.default.info(`Details popup opened for quote ${i + 1}`);
                    // Take screenshot of the popup
                    await page.screenshot({ path: `quote-${i + 1}-details.png` });
                    // Extract data from the popup with improved error handling
                    const detailedInfo = await page.evaluate(() => {
                        const additionalDetails = {
                            leftPanel: {
                                idvValue: null,
                                ncbPercentage: null,
                                planType: null,
                                finalPrice: null
                            },
                            premiumBreakup: {
                                sections: [],
                                total: null,
                                gst: null,
                                finalAmount: null
                            },
                            planDetails: {
                                covered: [],
                                notCovered: []
                            }
                        };
                        try {
                            // 1. Extract basic information from the left side
                            // Try multiple selectors for each piece of information
                            // Get Cover Value/IDV
                            const idvValueElement = document.querySelector('.ppl__idv-value span:last-child') ||
                                document.querySelector('[class*="idv"] span:last-child') ||
                                document.querySelector('[class*="cover-value"]');
                            additionalDetails.leftPanel.idvValue = idvValueElement?.textContent?.trim() || null;
                            // Get NCB percentage
                            const ncbElements = document.querySelectorAll('.ppl__idv-value, [class*="ncb"], [class*="bonus"]');
                            ncbElements.forEach(el => {
                                if (el.textContent?.includes('NCB') || el.textContent?.includes('Bonus')) {
                                    const ncbSpan = el.querySelector('span:last-child');
                                    additionalDetails.leftPanel.ncbPercentage = ncbSpan?.textContent?.trim() || null;
                                }
                            });
                            // Get Plan Type
                            const planTypeElement = document.querySelector('.ppl__idv-value .plan-type') ||
                                document.querySelector('.plan-type') ||
                                document.querySelector('[class*="plan-type"]');
                            additionalDetails.leftPanel.planType = planTypeElement?.textContent?.trim() || null;
                            // Get final price from Buy Now button
                            const buyNowPriceElement = document.querySelector('.ppl__buy-btn-value span:last-child') ||
                                document.querySelector('[class*="buy"] span:last-child') ||
                                document.querySelector('[class*="price"] span:last-child');
                            additionalDetails.leftPanel.finalPrice = buyNowPriceElement?.textContent?.trim() || null;
                            // 2. Check which tab is currently active
                            const premiumBreakupTabActive = document.querySelector('.tab label.selected_tab')?.textContent?.includes('Premium Breakup') ||
                                document.querySelector('[class*="selected_tab"]')?.textContent?.includes('Premium');
                            // 3. Extract data from the active tab
                            if (premiumBreakupTabActive) {
                                // Premium Breakup tab is active - extract this data
                                // Get all section headers
                                const sectionHeaders = document.querySelectorAll('.pbc__header, [class*="section-header"]');
                                sectionHeaders.forEach(header => {
                                    const sectionName = header.textContent?.trim();
                                    if (!sectionName || sectionName === 'Taxes')
                                        return;
                                    const section = { name: sectionName, items: [] };
                                    // Find items in this section
                                    let currentNode = header.nextElementSibling;
                                    while (currentNode &&
                                        !currentNode.classList.contains('pbc__header') &&
                                        !currentNode.classList.contains('pbc__total') &&
                                        !currentNode.className.includes('header') &&
                                        !currentNode.className.includes('total')) {
                                        if (currentNode.classList.contains('pbc__info') ||
                                            currentNode.className.includes('info') ||
                                            (currentNode.querySelector('.key') && currentNode.querySelector('.pull-right'))) {
                                            const key = currentNode.querySelector('.key')?.textContent?.trim() ||
                                                currentNode.querySelector('[class*="key"]')?.textContent?.trim();
                                            const value = currentNode.querySelector('.pull-right')?.textContent?.trim() ||
                                                currentNode.querySelector('[class*="value"]')?.textContent?.trim();
                                            if (key && value) {
                                                section.items.push({ key, value });
                                            }
                                        }
                                        currentNode = currentNode.nextElementSibling;
                                    }
                                    additionalDetails.premiumBreakup.sections.push(section);
                                });
                                // Get GST
                                const gstElement = document.querySelector('.gst-info-label + div') ||
                                    document.querySelector('[class*="gst"]');
                                additionalDetails.premiumBreakup.gst = gstElement?.textContent?.trim() || null;
                                // Get final amount
                                const totalAmounts = document.querySelectorAll('.pbc__total, [class*="total"]');
                                if (totalAmounts.length >= 2) {
                                    const firstTotalElement = totalAmounts[0].querySelector('div');
                                    const secondTotalElement = totalAmounts[1].querySelector('div');
                                    additionalDetails.premiumBreakup.total = firstTotalElement?.textContent?.trim() || null;
                                    additionalDetails.premiumBreakup.finalAmount = secondTotalElement?.textContent?.trim() || null;
                                }
                            }
                            else {
                                // Plan Details tab is active - extract this data
                                // Extract "What's Covered?" items
                                const coverageItems = document.querySelectorAll('.pdc__lside__box, [class*="covered"] > div, [class*="benefits"] > div');
                                coverageItems.forEach(item => {
                                    const title = item.querySelector('h5, h4, h3, [class*="title"]')?.textContent?.trim();
                                    const description = item.querySelector('span, p, [class*="description"]')?.textContent?.trim();
                                    if (title) {
                                        additionalDetails.planDetails.covered.push({
                                            title,
                                            description: description || ''
                                        });
                                    }
                                });
                                // Extract "What's not covered?" items
                                const exclusionItems = document.querySelectorAll('.pdc__rside__content li, [class*="not-covered"] li, [class*="exclusions"] li');
                                exclusionItems.forEach(item => {
                                    const text = item.textContent?.trim();
                                    if (text) {
                                        additionalDetails.planDetails.notCovered.push(text);
                                    }
                                });
                            }
                        }
                        catch (error) {
                            console.error('Error extracting details from popup:', error);
                        }
                        return additionalDetails;
                    });
                    // Now we need to make sure we get data from both tabs
                    // Try to find tab selectors that work for both flows
                    // If Premium Breakup tab was active, we need to switch to Plan Details tab
                    if (detailedInfo.premiumBreakup.sections.length > 0 && detailedInfo.planDetails.covered.length === 0) {
                        logger_1.default.info(`Switching to Plan Details tab for quote ${i + 1}`);
                        // Try multiple tab selectors
                        let tabSwitched = false;
                        const tabSelectors = [
                            '.tab label:not(.selected_tab)',
                            '[class*="tab"]:not([class*="selected"])',
                            'a[role="tab"]:not(.active)',
                            'ul.nav-tabs li:not(.active)'
                        ];
                        for (const selector of tabSelectors) {
                            try {
                                const exists = await page.evaluate((sel) => {
                                    return document.querySelector(sel) !== null;
                                }, selector);
                                if (exists) {
                                    await page.waitForSelector(selector, { timeout: 5000 });
                                    await page.click(selector);
                                    logger_1.default.info(`Switched to Plan Details tab using selector: ${selector}`);
                                    tabSwitched = true;
                                    break;
                                }
                            }
                            catch (error) {
                                logger_1.default.warn(`Tab selector ${selector} failed: ${error.message}`);
                            }
                        }
                        if (!tabSwitched) {
                            // Try to find tabs by their text content
                            tabSwitched = await page.evaluate(() => {
                                const elements = document.querySelectorAll('label, a, li, div');
                                for (const el of elements) {
                                    if (el.textContent?.includes('Plan') || el.textContent?.includes('Details') || el.textContent?.includes('Coverage')) {
                                        el.click();
                                        return true;
                                    }
                                }
                                return false;
                            });
                            if (tabSwitched) {
                                logger_1.default.info(`Switched to Plan Details tab using text search`);
                            }
                            else {
                                logger_1.default.warn(`Failed to switch to Plan Details tab for quote ${i + 1}`);
                            }
                        }
                        // Wait for tab content to load
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        // Take screenshot of Plan Details tab
                        await page.screenshot({ path: `quote-${i + 1}-plan-details.png` });
                        // Extract Plan Details data
                        const planDetailsData = await page.evaluate(() => {
                            const planDetails = {
                                covered: [],
                                notCovered: []
                            };
                            try {
                                // Extract "What's Covered?" items with multiple selectors
                                const coverageItems = document.querySelectorAll('.pdc__lside__box, [class*="covered"] > div, [class*="benefits"] > div');
                                coverageItems.forEach(item => {
                                    const title = item.querySelector('h5, h4, h3, [class*="title"]')?.textContent?.trim();
                                    const description = item.querySelector('span, p, [class*="description"]')?.textContent?.trim();
                                    if (title) {
                                        planDetails.covered.push({
                                            title,
                                            description: description || ''
                                        });
                                    }
                                });
                                // Extract "What's not covered?" items with multiple selectors
                                const exclusionItems = document.querySelectorAll('.pdc__rside__content li, [class*="not-covered"] li, [class*="exclusions"] li');
                                exclusionItems.forEach(item => {
                                    const text = item.textContent?.trim();
                                    if (text) {
                                        planDetails.notCovered.push(text);
                                    }
                                });
                            }
                            catch (error) {
                                console.error('Error extracting plan details:', error);
                            }
                            return planDetails;
                        });
                        // Merge with existing data
                        detailedInfo.planDetails = planDetailsData;
                    }
                    // If Plan Details tab was active, we need to switch to Premium Breakup tab
                    if (detailedInfo.planDetails.covered.length > 0 && detailedInfo.premiumBreakup.sections.length === 0) {
                        logger_1.default.info(`Switching to Premium Breakup tab for quote ${i + 1}`);
                        // Try multiple tab selectors
                        let tabSwitched = false;
                        const tabSelectors = [
                            '.tab label:not(.selected_tab)',
                            '[class*="tab"]:not([class*="selected"])',
                            'a[role="tab"]:not(.active)',
                            'ul.nav-tabs li:not(.active)'
                        ];
                        for (const selector of tabSelectors) {
                            try {
                                const exists = await page.evaluate((sel) => {
                                    return document.querySelector(sel) !== null;
                                }, selector);
                                if (exists) {
                                    await page.waitForSelector(selector, { timeout: 5000 });
                                    await page.click(selector);
                                    logger_1.default.info(`Switched to Premium Breakup tab using selector: ${selector}`);
                                    tabSwitched = true;
                                    break;
                                }
                            }
                            catch (error) {
                                logger_1.default.warn(`Tab selector ${selector} failed: ${error.message}`);
                            }
                        }
                        if (!tabSwitched) {
                            // Try to find tabs by their text content
                            tabSwitched = await page.evaluate(() => {
                                const elements = document.querySelectorAll('label, a, li, div');
                                for (const el of elements) {
                                    if (el.textContent?.includes('Premium') || el.textContent?.includes('Breakup') || el.textContent?.includes('Price')) {
                                        el.click();
                                        return true;
                                    }
                                }
                                return false;
                            });
                            if (tabSwitched) {
                                logger_1.default.info(`Switched to Premium Breakup tab using text search`);
                            }
                            else {
                                logger_1.default.warn(`Failed to switch to Premium Breakup tab for quote ${i + 1}`);
                            }
                        }
                        // Wait for tab content to load
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        // Take screenshot of Premium Breakup tab
                        await page.screenshot({ path: `quote-${i + 1}-premium-breakup.png` });
                        // Extract Premium Breakup data with improved selectors
                        const premiumBreakupData = await page.evaluate(() => {
                            const premiumBreakup = {
                                sections: [],
                                total: null,
                                gst: null,
                                finalAmount: null
                            };
                            try {
                                // Get all section headers with multiple selectors
                                const sectionHeaders = document.querySelectorAll('.pbc__header, [class*="section-header"]');
                                sectionHeaders.forEach(header => {
                                    const sectionName = header.textContent?.trim();
                                    if (!sectionName || sectionName === 'Taxes')
                                        return;
                                    const section = { name: sectionName, items: [] };
                                    // Find items in this section
                                    let currentNode = header.nextElementSibling;
                                    while (currentNode &&
                                        !currentNode.classList.contains('pbc__header') &&
                                        !currentNode.classList.contains('pbc__total') &&
                                        !currentNode.className.includes('header') &&
                                        !currentNode.className.includes('total')) {
                                        if (currentNode.classList.contains('pbc__info') ||
                                            currentNode.className.includes('info') ||
                                            (currentNode.querySelector('.key') && currentNode.querySelector('.pull-right'))) {
                                            const key = currentNode.querySelector('.key')?.textContent?.trim() ||
                                                currentNode.querySelector('[class*="key"]')?.textContent?.trim();
                                            const value = currentNode.querySelector('.pull-right')?.textContent?.trim() ||
                                                currentNode.querySelector('[class*="value"]')?.textContent?.trim();
                                            if (key && value) {
                                                section.items.push({ key, value });
                                            }
                                        }
                                        currentNode = currentNode.nextElementSibling;
                                    }
                                    premiumBreakup.sections.push(section);
                                });
                                // Get GST with multiple selectors
                                const gstElement = document.querySelector('.gst-info-label + div') ||
                                    document.querySelector('[class*="gst"]');
                                premiumBreakup.gst = gstElement?.textContent?.trim() || null;
                                // Get final amount with multiple selectors
                                const totalAmounts = document.querySelectorAll('.pbc__total, [class*="total"]');
                                if (totalAmounts.length >= 2) {
                                    const firstTotalElement = totalAmounts[0].querySelector('div');
                                    const secondTotalElement = totalAmounts[1].querySelector('div');
                                    premiumBreakup.total = firstTotalElement?.textContent?.trim() || null;
                                    premiumBreakup.finalAmount = secondTotalElement?.textContent?.trim() || null;
                                }
                            }
                            catch (error) {
                                console.error('Error extracting premium breakup:', error);
                            }
                            return premiumBreakup;
                        });
                        // Merge with existing data
                        detailedInfo.premiumBreakup = premiumBreakupData;
                    }
                    // Increase the wait time before closing the popup to ensure all data is extracted
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    // Add debug logging to see what we captured
                    logger_1.default.info(`Details captured for quote ${i + 1}: ${JSON.stringify(detailedInfo, null, 2)}`);
                    // Try multiple selectors for the close button
                    const closeSelectors = [
                        'div.cf-modal__close',
                        '[class*="modal-close"]',
                        '[class*="close-button"]',
                        'button.close',
                        '.modal [class*="close"]'
                    ];
                    let closeClicked = false;
                    for (const selector of closeSelectors) {
                        try {
                            const exists = await page.evaluate((sel) => {
                                return document.querySelector(sel) !== null;
                            }, selector);
                            if (exists) {
                                await page.waitForSelector(selector, { timeout: 5000 });
                                await page.click(selector);
                                logger_1.default.info(`Closed details popup using selector: ${selector}`);
                                closeClicked = true;
                                break;
                            }
                        }
                        catch (error) {
                            logger_1.default.warn(`Close button selector ${selector} failed: ${error.message}`);
                        }
                    }
                    if (!closeClicked) {
                        // Try to find close button by looking for × or text
                        closeClicked = await page.evaluate(() => {
                            const closeTexts = ['×', 'Close', 'CLOSE', 'Cancel', 'Done'];
                            const elements = document.querySelectorAll('button, a, div, span');
                            for (const el of elements) {
                                const text = el.textContent?.trim() || '';
                                if (closeTexts.includes(text)) {
                                    el.click();
                                    return true;
                                }
                            }
                            return false;
                        });
                        if (closeClicked) {
                            logger_1.default.info(`Closed details popup using text search`);
                        }
                        else {
                            logger_1.default.warn(`Could not find close button for quote ${i + 1}, trying to continue anyway`);
                            // Attempt to press Escape key as last resort
                            await page.keyboard.press('Escape');
                        }
                    }
                    // Wait a bit longer before processing next quote
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    // Combine basic and detailed info
                    enhancedQuotes.push({
                        ...quote,
                        details: detailedInfo
                    });
                }
                catch (error) {
                    logger_1.default.error(`Error processing details for quote ${i + 1}: ${error.message}`);
                    // Continue with next quote even if this one fails
                    enhancedQuotes.push({
                        ...quote,
                        details: { error: "Failed to retrieve details" }
                    });
                }
            }
            logger_1.default.info(`Enhanced data extraction complete for all quotes.`);
            return {
                success: true,
                quotes: enhancedQuotes
            };
        }
        catch (error) {
            logger_1.default.error(`Error extracting quotes: ${error.message}`);
            return {
                success: false,
                quotes: [],
                error: error.message
            };
        }
    }
    catch (error) {
        logger_1.default.error(`Scraping error: ${error.message}`);
        logger_1.default.error(error.stack || '');
        return {
            success: false,
            quotes: [],
            error: error.message
        };
    }
    finally {
        // Close the browser and readline interface in one place
        if (browser)
            await browser.close();
        if (rl)
            rl.close();
    }
}
