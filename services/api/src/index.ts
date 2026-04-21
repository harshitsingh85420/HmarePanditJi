import "./config/env"; // validates env vars on startup
import app from "./app";
import { startReviewReminderJob } from "./jobs/review-reminder";

const port = process.env.PORT || process.env.API_PORT || 3001;

const start = async () => {
  try {
    await app.listen({ port: Number(port), host: "0.0.0.0" });
    console.log(`🚀 HmarePanditJi API running on port ${port}`);

    // Phase 1: Simple setInterval for review reminders
    startReviewReminderJob();
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

// Graceful shutdown
process.on("SIGTERM", async () => {
  app.log.info("SIGTERM received — shutting down gracefully");
  await app.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  app.log.info("SIGINT received — shutting down gracefully");
  await app.close();
  process.exit(0);
});

export default app;
