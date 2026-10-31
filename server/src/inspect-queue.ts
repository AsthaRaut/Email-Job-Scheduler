import "dotenv/config";
import { emailQueue } from "./queues/email.queue.js";

async function inspectQueue() {
  try {
    const counts = await emailQueue.getJobCounts(
      "waiting",
      "delayed",
      "active",
      "completed",
      "failed"
    );

    console.log("Email Queue Status:");
    console.table(counts);

    const delayedJobs = await emailQueue.getDelayed();

    console.log("\nDelayed Jobs Details:");

    for (const job of delayedJobs) {
      const delayUntil = await job.getState();

      console.log({
        jobId: job.id,
        recipient: job.data.recipient,
        hourlyLimit: job.data.hourlyLimit,
        delayMs: job.data.delayMs,
        state: delayUntil,
        originalTimestamp: new Date(job.timestamp).toLocaleString(),
        originalDelayMs: job.delay,
        currentDelayedTimestamp: job.delay,
      });
    }
  } catch (error) {
    console.error("Queue inspection failed:", error);
  } finally {
    await emailQueue.close();
  }
}

inspectQueue();