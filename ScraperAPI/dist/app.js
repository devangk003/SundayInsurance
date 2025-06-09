"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const routes_1 = __importDefault(require("./api/routes"));
const errorHandler_1 = require("./middlewares/errorHandler");
const logger_1 = __importDefault(require("./utils/logger"));
const app = (0, express_1.default)();
// CORS configuration
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, postman, etc.)
        if (!origin)
            return callback(null, true);
        // Allow localhost and 127.0.0.1 on any port
        if (origin.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/)) {
            return callback(null, true);
        }
        // Allow local network IPs (192.168.x.x) on port 8080
        if (origin.match(/^https?:\/\/192\.168\.\d+\.\d+:8080$/)) {
            return callback(null, true);
        }
        // Reject other origins
        callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
// Middleware
app.use(express_1.default.json());
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
