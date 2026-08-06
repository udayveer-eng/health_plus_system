import { getTransporter, getSenderEmail } from "../config/mail.js";

/**
 * Core EmailService to abstract email delivery.
 * Only this file knows about Nodemailer.
 */
class EmailService {
  /**
   * Send an email payload
   * @param {Object} params
   * @param {string} params.to - Recipient email
   * @param {string} params.subject - Email subject
   * @param {string} params.html - HTML content
   * @param {string} [params.text] - Plain text fallback
   */
  static async sendEmail({ to, subject, html, text = "" }) {
    try {
      const transporter = getTransporter();
      
      const mailOptions = {
        from: getSenderEmail(),
        to,
        subject,
        html,
        text: text || subject, // simple fallback
      };

      // If no SMTP credentials are provided, mock it (graceful fallback for local dev)
      if (!process.env.SMTP_HOST) {
        console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
        console.log(`[MOCK EMAIL HTML]\n${html}`);
        return true;
      }

      const info = await transporter.sendMail(mailOptions);
      console.log(`[EMAIL SERVICE] Email sent successfully to ${to} (MessageId: ${info.messageId})`);
      return true;
    } catch (error) {
      // Re-throw the error so the BullMQ worker catches it, logs it, and initiates a retry
      throw new Error(`EmailService failed to send email to ${to}: ${error.message}`);
    }
  }
}

export default EmailService;
