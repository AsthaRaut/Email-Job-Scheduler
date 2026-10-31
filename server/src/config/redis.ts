import dotenv from "dotenv";
import { Redis } from "ioredis";

dotenv.config();

export const redisConnection = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT || 6379),
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

redisConnection.on("connect", () => {
  console.log("Redis connecting...");
});

redisConnection.on("ready", () => {
  console.log("Redis connected successfully");
});

redisConnection.on("error", (error) => {
  console.error("Redis connection error:", error.message);
});