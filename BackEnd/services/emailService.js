const nodemailer = require("nodemailer");

function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function sendWorkflowReminder(workflow) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: workflow.notificationEmail,
    subject: `AutoFlow AI reminder: ${workflow.name}`,
    text: [
      `Your workflow "${workflow.name}" is due.`,
      workflow.description ? `\n${workflow.description}` : "",
      "\nThis reminder was sent by AutoFlow AI.",
    ].join(""),
  });
}

module.exports = { isEmailConfigured, sendWorkflowReminder };
