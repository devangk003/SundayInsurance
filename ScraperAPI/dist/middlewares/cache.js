"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = exports.cacheMiddleware = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default();
exports.cache = cache;
const DEFAULT_TTL = 60 * 60; // 1 hour in seconds
const cacheMiddleware = (req, res, next) => {
    const { carReg } = req.body;
    const cacheKey = carReg;
    if (cacheKey && cache.has(cacheKey)) {
        const cachedData = cache.get(cacheKey);
        return res.status(200).json({ data: cachedData, source: "cache" });
    }
    next();
};
exports.cacheMiddleware = cacheMiddleware;
