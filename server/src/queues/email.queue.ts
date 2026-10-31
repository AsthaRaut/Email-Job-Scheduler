import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export interface EmailJobData {
  emailId: string;
  campaignId: string;
  userId: string;
  senderId: string;
  recipient: string;
  subject: string;
  body: string;
  hourlyLimit: number;
  delayMs: number;
}

export const EMAIL_QUEUE_NAME = "email-scheduler";

export const emailQueue = new Queue<EmailJobData>(EMAIL_QUEUE_NAME, {
  connection: redisConnection,

  defaultJobOptions: {
    attempts: 3,

    backoff: {
      type: "exponential",
      delay: 5000,
    },

    removeOnComplete: {
      count: 1000,
    },

    removeOnFail: {
      count: 5000,
    },
  },
});
