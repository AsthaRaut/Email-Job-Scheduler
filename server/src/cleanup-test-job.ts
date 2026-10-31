import "dotenv/config";
import { emailQueue } from "./queues/email.queue.js";

async function cleanup() {
  try {
    const job = await emailQueue.getJob("persistence-test-001");

    if (job) {
      await job.remove();
      console.log("Old persistence test job removed.");
    } else {
      console.log("Old persistence test job not found.");
    }
  } catch (error) {
    console.error("Cleanup failed:", error);
  } finally {
    await emailQueue.close();
  }
}

cleanup();
