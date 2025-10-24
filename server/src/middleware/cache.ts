import type { Request, Response, NextFunction } from 'express';

// Simple in-memory cache for low-resource servers
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function cacheMiddleware(duration: number = CACHE_DURATION) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') return next();

    const key = `${req.originalUrl || req.url}`;
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < duration) {
      return res.json(cached.data);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache response
    res.json = function (data: any) {
      cache.set(key, { data, timestamp: Date.now() });
      return originalJson(data);
    };

    next();
  };
}

// Clear cache for specific pattern
export function clearCache(pattern?: string) {
  if (!pattern) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

// Auto-cleanup old cache entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
}, 10 * 60 * 1000);
