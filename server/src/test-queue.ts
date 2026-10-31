import "dotenv/config";
import { emailQueue } from "./queues/email.queue.js";

async function verifyPersistence() {
  try {
    const job = await emailQueue.getJob("persistence-test-001");

    if (job) {
      console.log("SUCCESS: Job recovered after Redis restart!");
      console.log("Job ID:", job.id);
      console.log("Job State:", await job.getState());
      console.log("Job Data:", job.data);
    } else {
      console.log("FAILED: Job not found after Redis restart.");
    }
  } catch (error) {
    console.error("Persistence verification failed:", error);
  } finally {
    await emailQueue.close();
  }
}

verifyPersistence();