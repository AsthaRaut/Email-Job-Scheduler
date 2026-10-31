import "dotenv/config";
import { sendEmail } from "./services/email.service.js";

async function testEmail() {
  try {
    const result = await sendEmail({
      to: "test@example.com",
      subject: "ReachInbox Scheduler Test",
      body: "Hello! This is a test email from ReachInbox Scheduler.",
    });

    console.log("Email sent successfully!");
    console.log("Message ID:", result.messageId);
    console.log("Preview URL:", result.previewUrl);
  } catch (error) {
    console.error("Email sending failed:", error);
    process.exitCode = 1;
  }
}

testEmail();