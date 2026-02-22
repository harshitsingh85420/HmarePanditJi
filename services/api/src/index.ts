import "./config/env"; // validates env vars on startup
import app from "./app";

const port = process.env.PORT || process.env.API_PORT || 3001;

const server = app.listen(port, () => {
  console.log(`🚀 HmarePanditJi API running on port ${port}`);

  // Phase 1: Simple setInterval for review reminders
  const { startReviewReminderJob } = require("./jobs/review-reminder");
  startReviewReminderJob();
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received — shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received — shutting down gracefully");
  server.close(() => {
    process.exit(0);
  });
});

export default app;
