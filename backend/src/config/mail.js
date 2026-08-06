import nodemailer from "nodemailer";

/**
 * Singleton configuration for Nodemailer transporter.
 * This relies on environment variables, making it provider-agnostic.
 */
let transporter = null;

export const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "localhost",
      port: process.env.SMTP_PORT || 1025, // Default for tools like Mailhog locally
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
      },
    });
  }
  return transporter;
};

export const getSenderEmail = () => {
  return process.env.EMAIL_FROM || "noreply@healthpulse.com";
};
