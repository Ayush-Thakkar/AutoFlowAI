const mongoose = require("mongoose");
const Workflow = require("../models/Workflow");

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

function getWorkflowInput(body) {
  const triggerAt = body.triggerAt || null;
  const notificationEmail = (body.notificationEmail || "").trim();

  if (Boolean(triggerAt) !== Boolean(notificationEmail)) {
    const error = new Error("Set both a reminder time and recipient email, or leave both blank.");
    error.status = 400;
    throw error;
  }

  if (triggerAt && Number.isNaN(new Date(triggerAt).getTime())) {
    const error = new Error("Reminder time must be a valid date and time.");
    error.status = 400;
    throw error;
  }

  return {
    name: body.name,
    description: body.description,
    status: body.status,
    triggerAt,
    notificationEmail,
  };
}

function handleValidationError(error, res, next) {
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ message: error.message });
  }
  return next(error);
}

async function createWorkflow(req, res, next) {
  try {
    const workflow = await Workflow.create(getWorkflowInput(req.body));
    res.status(201).json(workflow);
  } catch (error) {
    handleValidationError(error, res, next);
  }
}

async function getWorkflows(req, res, next) {
  try {
    const workflows = await Workflow.find().sort({ createdAt: -1 });
    res.json(workflows);
  } catch (error) {
    next(error);
  }
}

async function getWorkflow(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid workflow ID." });
    }
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) return res.status(404).json({ message: "Workflow not found." });
    res.json(workflow);
  } catch (error) {
    next(error);
  }
}

async function updateWorkflow(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid workflow ID." });
    }

    const input = getWorkflowInput(req.body);
    const existingWorkflow = await Workflow.findById(req.params.id);
    if (!existingWorkflow) return res.status(404).json({ message: "Workflow not found." });

    const previousTriggerTime = existingWorkflow.triggerAt ? existingWorkflow.triggerAt.getTime() : null;
    const nextTriggerTime = input.triggerAt ? new Date(input.triggerAt).getTime() : null;
    const reminderChanged = previousTriggerTime !== nextTriggerTime ||
      existingWorkflow.notificationEmail !== input.notificationEmail;

    const workflow = await Workflow.findByIdAndUpdate(
      req.params.id,
      { ...input, ...(reminderChanged ? { emailSentAt: null } : {}) },
      { new: true, runValidators: true }
    );
    res.json(workflow);
  } catch (error) {
    handleValidationError(error, res, next);
  }
}

async function deleteWorkflow(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid workflow ID." });
    }
    const workflow = await Workflow.findByIdAndDelete(req.params.id);
    if (!workflow) return res.status(404).json({ message: "Workflow not found." });
    res.json({ message: "Workflow deleted successfully." });
  } catch (error) {
    next(error);
  }
}

module.exports = { createWorkflow, getWorkflows, getWorkflow, updateWorkflow, deleteWorkflow };
