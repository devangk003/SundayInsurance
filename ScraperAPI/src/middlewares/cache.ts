import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';

const cache = new NodeCache();
const DEFAULT_TTL = 60 * 60; // 1 hour in seconds

const cacheMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { carReg } = req.body;
  const cacheKey = carReg;

  if (cacheKey && cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    return res.status(200).json({ data: cachedData, source: "cache" });
  }
  next();
};

export { cacheMiddleware, cache };