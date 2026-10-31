import "dotenv/config";
import emailWorker from "./workers/email.worker.js";

async function startWorker() {
  try {
    await emailWorker.waitUntilReady();
    console.log("ReachInbox background worker started successfully.");
  } catch (error) {
    console.error("Failed to start email worker:", error);
    process.exit(1);
  }
}

startWorker();
