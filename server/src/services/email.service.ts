import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.ETHEREAL_HOST || "smtp.ethereal.email",
  port: Number(process.env.ETHEREAL_PORT || 587),
  secure: Number(process.env.ETHEREAL_PORT) === 465,
  auth: {
    user: process.env.ETHEREAL_USER || "",
    pass: process.env.ETHEREAL_PASS || "",
  },
});

interface SendEmailData {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmail(data: SendEmailData) {
  if (!process.env.ETHEREAL_USER || !process.env.ETHEREAL_PASS) {
    throw new Error("Ethereal SMTP credentials are missing");
  }

  const info = await transporter.sendMail({
    from: process.env.ETHEREAL_USER,
    to: data.to,
    subject: data.subject,
    text: data.body,
  });

  return {
    messageId: info.messageId,
    previewUrl: nodemailer.getTestMessageUrl(info),
  };
}