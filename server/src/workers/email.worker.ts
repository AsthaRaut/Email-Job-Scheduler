
import { Worker, Job, DelayedError } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { pool } from "../config/db.js";
import {
  EMAIL_QUEUE_NAME,
  EmailJobData,
} from "../queues/email.queue.js";
import { sendEmail } from "../services/email.service.js";
import { checkEmailRateLimits } from "../services/rate-limit.service.js";
import { sendSlackNotification } from "../services/slack.service.js";

const emailWorker = new Worker<EmailJobData>(
  EMAIL_QUEUE_NAME,

  async (job: Job<EmailJobData>, token?: string) => {
    const {
      recipient,
      subject,
      body,
      emailId,
      senderId,
      userId,
      hourlyLimit,
      delayMs,
    } = job.data;

    console.log(`Checking limits for job: ${job.id}`);

    const rateLimit = await checkEmailRateLimits(
      userId,
      senderId,
      hourlyLimit,
      delayMs
    );

    if (!rateLimit.allowed) {
      if (!token) {
        throw new Error("Worker lock token is missing");
      }

      const delayUntil = Date.now() + rateLimit.retryAfterMs;

      await job.moveToDelayed(delayUntil, token);

      console.log(
        `Email ${emailId} delayed for ${Math.ceil(
          rateLimit.retryAfterMs / 1000
        )} seconds`
      );

      if (rateLimit.senderLimitReached) {
        const notificationKey = `slack-notified:${senderId}`;

        const notificationLock = await redisConnection.set(
          notificationKey,
          "1",
          "EX",
          3600,
          "NX"
        );

        if (notificationLock === "OK") {
          await sendSlackNotification(
            `⚠️ Sender ${senderId} has reached its hourly email limit of ${hourlyLimit}. Remaining emails have been rescheduled.`
          );
        }
      }

      throw new DelayedError();
    }

    console.log(`Processing email job: ${job.id}`);

    await pool.query(
      `UPDATE emails
       SET status = 'processing',
           attempts = attempts + 1
       WHERE id::text = $1
         AND status IN ('scheduled', 'processing')`,
      [emailId]
    );

    const result = await sendEmail({
      to: recipient,
      subject,
      body,
    });

    await pool.query(
      `UPDATE emails
       SET status = 'sent',
           sent_at = NOW(),
           error = NULL
       WHERE id::text = $1`,
      [emailId]
    );

    console.log("Email sent successfully!");
    console.log("Email ID:", emailId);
    console.log("Message ID:", result.messageId);
    console.log("Preview URL:", result.previewUrl);

    return {
      success: true,
      emailId,
      messageId: result.messageId,
      previewUrl: result.previewUrl,
    };
  },

  {
    connection: redisConnection,
    concurrency: 1,
  }
);

emailWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

emailWorker.on("failed", async (job, error) => {
  console.error(`Job ${job?.id} failed:`, error.message);

  if (!job) return;

  const maxAttempts = Number(job.opts.attempts ?? 1);

  if (job.attemptsMade >= maxAttempts) {
    try {
      await pool.query(
        `UPDATE emails
         SET status = 'failed',
             error = $2
         WHERE id::text = $1`,
        [job.data.emailId, error.message]
      );

      console.log(`Email ${job.data.emailId} marked as failed`);
    } catch (dbError) {
      console.error("Failed to update email status:", dbError);
    }
  }
});

emailWorker.on("error", (error) => {
  console.error("Worker error:", error.message);
});

console.log("Email worker is running...");

export default emailWorker;
