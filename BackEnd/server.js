require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const workflowRoutes = require("./routes/workflowRoutes");
const { startWorkflowReminderJob } = require("./jobs/workflowReminderJob");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "AutoFlow AI API is running" });
});

app.use("/api/workflows", workflowRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong on the server.",
  });
});

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing. Add it to your .env file.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
      startWorkflowReminderJob();
    });
  } catch (error) {
    console.error(`Could not start server: ${error.message}`);
    process.exit(1);
  }
}

startServer();
