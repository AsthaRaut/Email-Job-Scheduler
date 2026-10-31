import "dotenv/config";
import { emailQueue } from "./queues/email.queue.js";

const emailIds = [
  "e5840971-82fc-4f79-8783-d38c882c16e4",
  "55d9eaec-7a72-4b1e-9381-bb2294d90fb8",
];

async function verifyCampaignQueue() {
  try {
    for (const emailId of emailIds) {
      const job = await emailQueue.getJob(emailId);

      if (!job) {
        console.log(`Job not found: ${emailId}`);
        continue;
      }

      console.log({
        jobId: job.id,
        recipient: job.data.recipient,
        state: await job.getState(),
        delay: job.opts.delay,
      });
    }
  } catch (error) {
    console.error("Queue verification failed:", error);
  } finally {
    await emailQueue.close();
  }
}

verifyCampaignQueue();