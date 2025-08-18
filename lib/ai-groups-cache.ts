// Simple in-memory cache for agent responses (production should use Redis)
interface CacheEntry {
  response: string;
  timestamp: number;
  expiresAt: number;
}

const responseCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generate cache key for agent response
 */
function generateCacheKey(
  agentId: string,
  userMessage: string,
  systemPrompt: string
): string {
  // Simple hash of agent + message + prompt
  const content = `${agentId}:${userMessage}:${systemPrompt}`;
  return Buffer.from(content).toString('base64').slice(0, 50);
}

/**
 * Get cached response if available and not expired
 */
export function getCachedResponse(
  agentId: string,
  userMessage: string,
  systemPrompt: string
): string | null {
  const key = generateCacheKey(agentId, userMessage, systemPrompt);
  const entry = responseCache.get(key);
  
  if (!entry) return null;
  
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(key);
    return null;
  }
  
  return entry.response;
}

/**
 * Cache agent response
 */
export function setCachedResponse(
  agentId: string,
  userMessage: string,
  systemPrompt: string,
  response: string
): void {
  const key = generateCacheKey(agentId, userMessage, systemPrompt);
  const now = Date.now();
  
  responseCache.set(key, {
    response,
    timestamp: now,
    expiresAt: now + CACHE_TTL_MS,
  });
  
  // Clean up expired entries periodically
  if (responseCache.size > 100) {
    cleanupExpiredEntries();
  }
}

/**
 * Clean up expired cache entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of responseCache.entries()) {
    if (now > entry.expiresAt) {
      responseCache.delete(key);
    }
  }
}

/**
 * Check if caching should be enabled (disable for sensitive content)
 */
export function shouldCacheResponse(userMessage: string): boolean {
  const sensitiveKeywords = ['password', 'secret', 'private', 'confidential', 'personal'];
  const messageLower = userMessage.toLowerCase();
  
  return !sensitiveKeywords.some(keyword => messageLower.includes(keyword));
}