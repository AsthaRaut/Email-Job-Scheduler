import { redisConnection } from "./config/redis.js";

async function testRedis() {
  try {
    const response = await redisConnection.ping();

    console.log("Redis Test Response:", response);

    await redisConnection.quit();
    process.exit(0);
  } catch (error) {
    console.error("Redis Test Failed:", error);
    await redisConnection.quit();
    process.exit(1);
  }
}

testRedis();