export const generateConsultationScheduledEmail = (variables) => {
  const { patientName, doctorName, scheduledTime, meetingUrl } = variables;

  const subject = "Consultation Scheduled Successfully";
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Hello ${patientName},</h2>
      <p>Your online consultation with Dr. ${doctorName} has been scheduled successfully.</p>
      <p><strong>Time:</strong> ${scheduledTime}</p>
      <p>You can join the consultation using the link below:</p>
      <a href="${meetingUrl}" style="display: inline-block; padding: 10px 15px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">Join Consultation</a>
      <br />
      <p>Please join 5 minutes early.</p>
      <p>Best regards,<br/><strong>HealthPulse Team</strong></p>
    </div>
  `;

  return { subject, html };
};

export const generateConsultationReminderEmail = (variables) => {
  const { patientName, doctorName, scheduledTime, meetingUrl, minutesLeft } = variables;

  const subject = `Reminder: Consultation in ${minutesLeft} minutes`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Hello ${patientName},</h2>
      <p>This is a reminder that your online consultation with Dr. ${doctorName} is starting in ${minutesLeft} minutes.</p>
      <p><strong>Time:</strong> ${scheduledTime}</p>
      <p>You can join the consultation using the link below:</p>
      <a href="${meetingUrl}" style="display: inline-block; padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Join Consultation</a>
      <br />
      <p>Best regards,<br/><strong>HealthPulse Team</strong></p>
    </div>
  `;

  return { subject, html };
};

export const generateConsultationCancelledEmail = (variables) => {
  const { patientName, doctorName, scheduledTime } = variables;

  const subject = "Consultation Cancelled";
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Hello ${patientName},</h2>
      <p>We regret to inform you that your online consultation with Dr. ${doctorName} scheduled for ${scheduledTime} has been cancelled.</p>
      <p>Please log in to your dashboard to reschedule.</p>
      <br />
      <p>Best regards,<br/><strong>HealthPulse Team</strong></p>
    </div>
  `;

  return { subject, html };
};
