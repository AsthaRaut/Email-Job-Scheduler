import nodemailer from "nodemailer";

async function createEtherealAccount() {
  try {
    const account = await nodemailer.createTestAccount();

    console.log("Ethereal account created successfully!");
    console.log("SMTP Host:", account.smtp.host);
    console.log("SMTP Port:", account.smtp.port);
    console.log("SMTP User:", account.user);
    console.log("SMTP Password:", account.pass);
  } catch (error) {
    console.error("Ethereal account creation failed:", error);
  }
}

createEtherealAccount();