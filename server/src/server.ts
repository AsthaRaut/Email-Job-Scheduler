import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testDatabaseConnection } from "./config/db.js";
import emailRoutes from "./routes/email.routes.js";
import emailWorker from "./workers/email.worker.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "ReachInbox Scheduler API is running",
  });
});

app.use("/api/emails", emailRoutes);

async function startServer() {
  try {
    await testDatabaseConnection();

    // Wait until the background worker connects to Redis
    await emailWorker.waitUntilReady();
    console.log("Background worker started successfully.");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Application startup failed:", error);
    process.exit(1);
  }
}

startServer();
