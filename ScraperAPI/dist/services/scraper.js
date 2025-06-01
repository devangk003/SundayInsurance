"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrape = scrape;
const puppeteer_1 = __importDefault(require("puppeteer"));
const config_1 = __importDefault(require("../config/config"));
const logger_1 = __importDefault(require("../utils/logger"));
function scrape(carReg, phoneNumber, isPolicyExpired, hasMadeClaim, hasCngLpg) {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield puppeteer_1.default.launch({
            headless: false,
            // headless: "new",
        });
        const page = yield browser.newPage();
        logger_1.default.info(`Scraping started for carReg: ${carReg}`);
        try {
            logger_1.default.info("Navigating to the target URL");
            yield page.goto(config_1.default.TARGET_URL).catch((e) => {
                logger_1.default.error(`Error navigating to target URL: ${e.message}`);
                throw e;
            });
            logger_1.default.info("Entering car registration and phone number");
            yield page.type("#registration_number", carReg).catch((e) => {
                logger_1.default.error(`Error entering registration number: ${e.message}`);
                throw e;
            });
            yield page.type("#phone_number", phoneNumber).catch((e) => {
                logger_1.default.error(`Error entering phone number: ${e.message}`);
                throw e;
            });
            logger_1.default.info("Clicking 'Get Quotes' button");
            yield Promise.all([
                page.waitForNavigation({ timeout: 60000 }).catch((e) => {
                    logger_1.default.error(`Navigation timeout after clicking 'Get Quotes': ${e.message}`);
                    throw e;
                }),
                page.click(".get-quotes-btn").catch((e) => {
                    logger_1.default.error(`Error clicking 'Get Quotes' button: ${e.message}`);
                    throw e;
                }),
            ]).catch((e) => {
                throw e;
            });
            logger_1.default.info("Handling policy expiry question");
            yield page.waitForSelector(".card-options", { timeout: 60000 }).catch((e) => {
                logger_1.default.error(`Timeout waiting for card options (expiry): ${e.message}`);
                throw e;
            });
            const expiredOption = isPolicyExpired ? 'label[for="expired_yes"]' : 'label[for="expired_no"]';
            yield page.click(expiredOption).catch((e) => {
                logger_1.default.error(`Error clicking expiry option: ${e.message}`);
                throw e;
            });
            logger_1.default.info("Clicking 'Next' after policy expiry");
            yield Promise.all([
                page.waitForNavigation({ timeout: 60000 }).catch((e) => {
                    logger_1.default.error(`Navigation timeout after policy expiry: ${e.message}`);
                    throw e;
                }),
                page.click(".next-btn").catch((e) => {
                    logger_1.default.error(`Error clicking 'Next' after expiry: ${e.message}`);
                    throw e;
                }),
            ]).catch((e) => {
                throw e;
            });
            if (isPolicyExpired) {
                logger_1.default.info("Handling claims question (policy expired)");
                yield page.waitForSelector(".card-options", { timeout: 60000 }).catch((e) => {
                    logger_1.default.error(`Timeout waiting for card options (claims): ${e.message}`);
                    throw e;
                });
                const claimOption = hasMadeClaim ? 'label[for="claims_yes"]' : 'label[for="claims_no"]';
                yield page.click(claimOption).catch((e) => {
                    logger_1.default.error(`Error clicking claims option: ${e.message}`);
                    throw e;
                });
                logger_1.default.info("Clicking 'Next' after claims (policy expired)");
                yield Promise.all([
                    page.waitForNavigation({ timeout: 60000 }).catch((e) => {
                        logger_1.default.error(`Navigation timeout after claims (expired): ${e.message}`);
                        throw e;
                    }),
                    page.click(".next-btn").catch((e) => {
                        logger_1.default.error(`Error clicking 'Next' after claims (expired): ${e.message}`);
                        throw e;
                    }),
                ]).catch((e) => {
                    throw e;
                });
            }
            logger_1.default.info("Handling CNG/LPG question");
            yield page.waitForSelector(".card-options", { timeout: 60000 }).catch((e) => {
                logger_1.default.error(`Timeout waiting for card options (CNG/LPG): ${e.message}`);
                throw e;
            });
            const fuelOption = hasCngLpg ? 'label[for="fuel_yes"]' : 'label[for="fuel_no"]';
            yield page.click(fuelOption).catch((e) => {
                logger_1.default.error(`Error clicking CNG/LPG option: ${e.message}`);
                throw e;
            });
            logger_1.default.info("Clicking 'Next' after CNG/LPG");
            yield Promise.all([
                page.waitForNavigation({ timeout: 60000 }).catch((e) => {
                    logger_1.default.error(`Navigation timeout after CNG/LPG: ${e.message}`);
                    throw e;
                }),
                page.click(".next-btn").catch((e) => {
                    logger_1.default.error(`Error clicking 'Next' after CNG/LPG: ${e.message}`);
                    throw e;
                }),
            ]).catch((e) => {
                throw e;
            });
        }
        catch (error) {
            yield browser.close();
            throw error; // Re-throw the error to be handled by the controller
        }
        try {
            yield page.waitForSelector(".plan-card-container", { timeout: 60000 });
            const quotes = yield page.evaluate(() => {
                const quoteElements = document.querySelectorAll(".plan-card");
                const quotesData = [];
                quoteElements.forEach((element) => {
                    var _a, _b, _c, _d;
                    const insurerName = ((_a = element.querySelector(".insurer-name")) === null || _a === void 0 ? void 0 : _a.textContent) || "N/A";
                    const price = ((_b = element.querySelector(".total-price")) === null || _b === void 0 ? void 0 : _b.textContent) || "N/A";
                    const idv = ((_c = element.querySelector(".idv-value")) === null || _c === void 0 ? void 0 : _c.textContent) || "N/A";
                    const planType = ((_d = element.querySelector(".plan-type")) === null || _d === void 0 ? void 0 : _d.textContent) || "N/A";
                    quotesData.push({
                        insurerName,
                        price,
                        idv,
                        planType,
                    });
                });
                return quotesData;
            });
            logger_1.default.info("Data extraction successful");
            yield browser.close();
            return quotes;
        }
        catch (error) {
            logger_1.default.error(`Error during data extraction: ${error.message}`);
            yield browser.close();
            throw error;
        }
        finally {
            logger_1.default.info(`Scraping finished for carReg: ${carReg}`);
        }
    });
}
/* Example Usage with hardcoded values (for testing purposes):
/*
  try {
    await page.goto("https://www.insure24.co.za/");

    await page.type("#registration_number", "CJ34GP");
    await page.type("#phone_number", "0786259619");

    await Promise.all([
      page.waitForNavigation(),
      page.click(".get-quotes-btn"),
    ]);

    await page.waitForSelector(".card-options", { timeout: 60000 });
    await page.click('label[for="expired_yes"]');

    await Promise.all([
      page.waitForNavigation(),
      page.click(".next-btn"),
    ]);

    await page.waitForSelector(".card-options", { timeout: 60000 });
    await page.click('label[for="claims_yes"]');

    await Promise.all([
      page.waitForNavigation(),
      page.click(".next-btn"),
    ]);

    await page.waitForSelector(".card-options", { timeout: 60000 });

    await page.click('label[for="fuel_yes"]');

    await Promise.all([
      page.waitForNavigation(),
      page.click(".next-btn"),
    ]);
  } catch (error) {
    console.error("Error during navigation and form filling:", error);
    await browser.close();
    return "Error during navigation and form filling";
  }

  try {
    await page.waitForSelector(".plan-card-container", { timeout: 60000 });
    await browser.close();
    return "Scraping completed successfully!";
  } catch (error) {
    console.error("Error during scraping:", error);
    await browser.close();
    return "Scraping failed";
  }
}

export { scrape };
*/ 
