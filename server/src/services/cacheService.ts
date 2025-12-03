import { ICacheItem } from "../types";

class CacheService {
  private cache: Map<string, ICacheItem<unknown>>;
  private TTL: number;

  constructor() {
    this.cache = new Map();
    this.TTL = 15 * 60 * 1000; // 15 minutes
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key) as ICacheItem<T> | undefined;
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  set<T>(key: string, value: T, ttl: number = this.TTL): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl,
    });
  }

  isValid(key: string): boolean {
    return this.get(key) !== null;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

const cacheService = new CacheService();
setInterval(() => cacheService.cleanup(), 5 * 60 * 1000);

export default cacheService;
