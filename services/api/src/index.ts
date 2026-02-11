import { env } from "./config/env";
import app from "./app";
import { logger } from "./utils/logger";

const PORT = env.API_PORT;

const server = app.listen(PORT, () => {
  logger.info(`
  ────────────────────────────────────────────
   HmarePanditJi API  v0.1.0
  ────────────────────────────────────────────
   Port        : ${PORT}
   Environment : ${env.NODE_ENV}
   API prefix  : http://localhost:${PORT}/api/v1
   Health      : http://localhost:${PORT}/health
  ────────────────────────────────────────────
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received — shutting down gracefully");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received — shutting down gracefully");
  server.close(() => {
    process.exit(0);
  });
});

export default app;
