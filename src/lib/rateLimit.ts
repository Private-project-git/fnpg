// src/lib/rateLimit.ts

interface RateLimitRecord {
  timestamps: number[];
}

const loginAttempts = new Map<string, RateLimitRecord>();

const LIMIT = 5; // max 5 attempts
const WINDOW = 60 * 1000; // per 1 minute sliding window

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  let record = loginAttempts.get(ip);
  
  if (!record) {
    record = { timestamps: [] };
    loginAttempts.set(ip, record);
  }
  
  // Filter out timestamps older than the window duration
  record.timestamps = record.timestamps.filter(t => now - t < WINDOW);
  
  if (record.timestamps.length >= LIMIT) {
    return true;
  }
  
  record.timestamps.push(now);
  return false;
}
