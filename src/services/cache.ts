import { CacheEntry, OfferConfig, Env } from '../types';

export class CacheManager {
  private kv: KVNamespace;
  private cache: Cache;

  constructor(env: Env) {
    this.kv = env.CONFIG_CACHE;
    this.cache = caches.default;
  }

  // Generate cache key for app configuration
  private getConfigKey(bundleId: string, platform: string): string {
    return `config:${bundleId}:${platform}`;
  }

  // Generate cache key for offer URL
  private getOfferKey(bundleId: string, afId: string): string {
    return `offer:${bundleId}:${afId}`;
  }

  // Get configuration from cache
  async getConfig(bundleId: string, platform: string): Promise<OfferConfig | null> {
    try {
      // First check Cloudflare Cache API (fastest)
      const cacheKey = this.getConfigKey(bundleId, platform);
      const cachedResponse = await this.cache.match(cacheKey);
      
      if (cachedResponse) {
        const data = await cachedResponse.json();
        return data;
      }

      // Then check KV Storage
      const kvData = await this.kv.get(cacheKey);
      if (kvData) {
        const config: OfferConfig = JSON.parse(kvData);
        
        // Check if config is expired
        if (config.expires && Date.now() > config.expires * 1000) {
          await this.kv.delete(cacheKey);
          return null;
        }

        // Store in cache for faster subsequent requests
        await this.setCache(cacheKey, config, 300); // 5 minutes TTL
        return config;
      }

      return null;
    } catch (error) {
      console.error('Error getting config from cache:', error);
      return null;
    }
  }

  // Set configuration in cache
  async setConfig(bundleId: string, platform: string, config: OfferConfig, ttl: number = 3600): Promise<void> {
    try {
      const cacheKey = this.getConfigKey(bundleId, platform);
      
      // Store in KV with TTL
      await this.kv.put(cacheKey, JSON.stringify(config), { expirationTtl: ttl });
      
      // Store in cache for immediate access
      await this.setCache(cacheKey, config, 300); // 5 minutes TTL
    } catch (error) {
      console.error('Error setting config in cache:', error);
    }
  }

  // Get offer URL from cache
  async getOffer(bundleId: string, afId: string): Promise<string | null> {
    try {
      const offerKey = this.getOfferKey(bundleId, afId);
      const cachedResponse = await this.cache.match(offerKey);
      
      if (cachedResponse) {
        const data = await cachedResponse.json();
        return data.url;
      }

      const kvData = await this.kv.get(offerKey);
      if (kvData) {
        const entry: CacheEntry<{ url: string }> = JSON.parse(kvData);
        
        // Check if entry is expired
        if (Date.now() > entry.expires) {
          await this.kv.delete(offerKey);
          return null;
        }

        // Store in cache for faster subsequent requests
        await this.setCache(offerKey, entry.data, 300);
        return entry.data.url;
      }

      return null;
    } catch (error) {
      console.error('Error getting offer from cache:', error);
      return null;
    }
  }

  // Set offer URL in cache
  async setOffer(bundleId: string, afId: string, url: string, expires: number, ttl: number = 3600): Promise<void> {
    try {
      const offerKey = this.getOfferKey(bundleId, afId);
      const entry: CacheEntry<{ url: string }> = {
        data: { url },
        expires: expires * 1000, // Convert to milliseconds
        created: Date.now(),
      };
      
      // Store in KV with TTL
      await this.kv.put(offerKey, JSON.stringify(entry), { expirationTtl: ttl });
      
      // Store in cache for immediate access
      await this.setCache(offerKey, entry.data, 300);
    } catch (error) {
      console.error('Error setting offer in cache:', error);
    }
  }

  // Generic cache setter
  private async setCache(key: string, data: any, ttl: number): Promise<void> {
    try {
      const response = new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `public, max-age=${ttl}`,
        },
      });
      
      await this.cache.put(key, response);
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  // Clear cache for specific app
  async clearAppCache(bundleId: string, platform: string): Promise<void> {
    try {
      const configKey = this.getConfigKey(bundleId, platform);
      await this.kv.delete(configKey);
      await this.cache.delete(configKey);
    } catch (error) {
      console.error('Error clearing app cache:', error);
    }
  }

  // Get cache statistics
  async getCacheStats(): Promise<{ kvSize: number; cacheSize: number }> {
    try {
      // This is a simplified version - in production you might want more detailed stats
      return {
        kvSize: 0, // KV doesn't provide size info directly
        cacheSize: 0, // Cache API doesn't provide size info directly
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { kvSize: 0, cacheSize: 0 };
    }
  }
}