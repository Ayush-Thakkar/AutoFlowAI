const Workflow = require("../models/Workflow");
const { isEmailConfigured, sendWorkflowReminder } = require("../services/emailService");

async function checkDueWorkflowReminders() {
  if (!isEmailConfigured()) return;

  try {
    const dueWorkflows = await Workflow.find({
      status: "Active",
      triggerAt: { $lte: new Date() },
      notificationEmail: { $ne: "" },
      emailSentAt: null,
    });

    for (const workflow of dueWorkflows) {
      try {
        await sendWorkflowReminder(workflow);
        workflow.emailSentAt = new Date();
        await workflow.save();
        console.log(`Sent reminder email for workflow "${workflow.name}"`);
      } catch (error) {
        console.error(`Could not send reminder for workflow "${workflow.name}": ${error.message}`);
      }
    }
  } catch (error) {
    console.error(`Could not check due workflow reminders: ${error.message}`);
  }
}

function startWorkflowReminderJob() {
  if (!isEmailConfigured()) {
    console.warn("Email reminders are off. Configure SMTP_HOST, SMTP_USER, and SMTP_PASS to enable them.");
  }
  const configuredInterval = Number(process.env.EMAIL_CHECK_INTERVAL_MS || 60000);
  const interval = Number.isFinite(configuredInterval) ? Math.max(configuredInterval, 5000) : 60000;
  setInterval(checkDueWorkflowReminders, interval);
}

module.exports = { startWorkflowReminderJob, checkDueWorkflowReminders };
