const express = require("express");
const workflowController = require("../controllers/workflowController");

const router = express.Router();

router.post("/", workflowController.createWorkflow);
router.get("/", workflowController.getWorkflows);
router.get("/:id", workflowController.getWorkflow);
router.put("/:id", workflowController.updateWorkflow);
router.delete("/:id", workflowController.deleteWorkflow);

module.exports = router;
