"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const routes_1 = __importDefault(require("./api/routes"));
const errorHandler_1 = require("./middlewares/errorHandler");
const logger_1 = __importDefault(require("./utils/logger"));
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: ['http://localhost:8080', 'http://localhost:3000'],
    credentials: true
}));
app.use((0, helmet_1.default)());
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { success: false, error: 'Too many requests, please try again later' }
});
app.use(limiter);
// Routes
app.use('/api', routes_1.default);
// Root path
app.get('/', (req, res) => {
    res.json({
        message: 'Insurance Quote Scraper API',
        endpoints: {
            quotes: 'POST /api/quotes'
        }
    });
});
// Error handler
app.use(errorHandler_1.errorHandler);
// Handle 404
app.use((req, res) => {
    logger_1.default.warn(`Route not found: ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});
exports.default = app;
