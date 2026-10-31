
import "dotenv/config";
import { emailQueue } from "./queues/email.queue.js";
import emailWorker from "./workers/email.worker.js";

async function testWorker() {
  try {
    await emailWorker.waitUntilReady();

    const testJobId = `worker-test-${Date.now()}`;

    const job = await emailQueue.add(
      "send-email",
      {
        emailId: testJobId,
        campaignId: "test-campaign",
        userId: "test-user",
        senderId: "test-sender",
        hourlyLimit: 100,
        delayMs: 2000,
        recipient: "test@example.com",
        subject: "ReachInbox Worker Test",
        body: "Hello! Background email worker is working.",
      },
      {
        jobId: testJobId,
      }
    );

    console.log("Test job added:", job.id);
    console.log("Waiting for worker to process the email...");
  } catch (error) {
    console.error("Worker test failed:", error);
    process.exit(1);
  }
}

testWorker();
