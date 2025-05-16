import type { CacheOptions } from "./types"

// Simple in-memory cache
const cache: Record<string, { data: any; timestamp: number }> = {}

// Default TTL is 5 minutes
const DEFAULT_TTL = 5 * 60 * 1000

export function getCachedData<T>(key: string, options: CacheOptions = {}): T | null {
  // If force refresh is requested, return null
  if (options.forceRefresh) {
    return null
  }

  const cachedItem = cache[key]
  if (!cachedItem) {
    return null
  }

  const ttl = options.ttl ? options.ttl * 1000 : DEFAULT_TTL
  const now = Date.now()

  // Check if the cached data is still valid
  if (now - cachedItem.timestamp > ttl) {
    // Data is stale, remove it from cache
    delete cache[key]
    return null
  }

  return cachedItem.data as T
}

export function setCachedData<T>(key: string, data: T): void {
  cache[key] = {
    data,
    timestamp: Date.now(),
  }
}

export function clearCache(keyPrefix?: string): void {
  if (keyPrefix) {
    // Clear only keys that start with the prefix
    Object.keys(cache).forEach((key) => {
      if (key.startsWith(keyPrefix)) {
        delete cache[key]
      }
    })
  } else {
    // Clear all cache
    Object.keys(cache).forEach((key) => {
      delete cache[key]
    })
  }
}

export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: Object.keys(cache).length,
    keys: Object.keys(cache),
  }
}
