"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler = (err, req, res, next) => {
    logger_1.default.error(`Error: ${err.message}`);
    logger_1.default.error(err.stack || '');
    res.status(500).json({
        success: false,
        error: 'Server error occurred',
    });
};
exports.errorHandler = errorHandler;
