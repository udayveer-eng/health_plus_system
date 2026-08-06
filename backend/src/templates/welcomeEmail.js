export const generateWelcomeEmail = (variables) => {
  const { name } = variables;

  const subject = "Welcome to HealthPulse!";
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Welcome to HealthPulse, ${name}!</h2>
      <p>We are thrilled to have you on board. HealthPulse is designed to make healthcare management seamless and effortless.</p>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <br />
      <p>Best regards,</p>
      <p><strong>The HealthPulse Team</strong></p>
    </div>
  `;

  return { subject, html };
};
