
import { redisConnection } from "../config/redis.js";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
  senderLimitReached: boolean;
}

const RATE_LIMIT_SCRIPT = `
local limits = {
  tonumber(ARGV[1]),
  tonumber(ARGV[2]),
  tonumber(ARGV[3])
}

local window = tonumber(ARGV[4])
local delayMs = tonumber(ARGV[5]) or 0
local now = tonumber(ARGV[6])
local maxWait = 0
local senderLimitReached = 0

for i = 1, 3 do
  local current = tonumber(redis.call("GET", KEYS[i]) or "0")

  if current >= limits[i] then
    local ttl = redis.call("PTTL", KEYS[i])

    if ttl < 0 then ttl = window end
    if ttl > maxWait then maxWait = ttl end

    if i == 3 then
      senderLimitReached = 1
    end
  end
end

local nextAllowed = tonumber(redis.call("GET", KEYS[4]) or "0")
local delayWait = nextAllowed - now

if delayWait > maxWait then
  maxWait = delayWait
end

if maxWait > 0 then
  return {0, 0, maxWait, senderLimitReached}
end

for i = 1, 3 do
  local updated = redis.call("INCR", KEYS[i])

  if updated == 1 then
    redis.call("PEXPIRE", KEYS[i], window)
  end
end

if delayMs > 0 then
  redis.call("SET", KEYS[4], now + delayMs)
end

local remaining = limits[3] -
  tonumber(redis.call("GET", KEYS[3]))

return {1, remaining, 0, 0}
`;

export async function checkEmailRateLimits(
  userId: string,
  senderId: string,
  senderLimit: number,
  minimumDelayMs: number
): Promise<RateLimitResult> {
  const windowMs = 60 * 60 * 1000;

  const globalLimit = Number(
    process.env.GLOBAL_HOURLY_LIMIT || 1000
  );

  const tenantLimit = Number(
    process.env.TENANT_HOURLY_LIMIT || 100
  );

  const now = Date.now();

  const result = (await redisConnection.eval(
    RATE_LIMIT_SCRIPT,
    4,
    "email-rate-limit:global",
    `email-rate-limit:tenant:${userId}`,
    `email-rate-limit:sender:${senderId}`,
    `email-min-delay:${senderId}`,
    globalLimit,
    tenantLimit,
    senderLimit,
    windowMs,
    minimumDelayMs,
    now
  )) as [number, number, number, number];

  return {
    allowed: result[0] === 1,
    remaining: result[1],
    retryAfterMs: result[2],
    senderLimitReached: result[3] === 1,
  };
}
