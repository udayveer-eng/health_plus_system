export const generatePasswordResetEmail = (variables) => {
  const { resetLink } = variables;

  const subject = "HealthPulse - Password Reset Request";
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Password Reset</h2>
      <p>We received a request to reset your password.</p>
      <p>Click the link below to set a new password:</p>
      <a href="${resetLink}" style="display: inline-block; padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
      <br />
      <p>Best regards,</p>
      <p><strong>The HealthPulse Team</strong></p>
    </div>
  `;

  return { subject, html };
};
