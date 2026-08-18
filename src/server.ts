import "dotenv/config";
import { createConfiguredApp } from "./runtime.js";

const { app, config, provider } = createConfiguredApp();

const server = app.listen(config.PORT, () => {
  console.log(
    `TTB label verifier listening on port ${config.PORT} with ${provider.name}.`,
  );
});

function shutdown(signal: string): void {
  console.log(`${signal} received; closing HTTP server.`);
  server.close((error) => {
    if (error) {
      console.error("HTTP server shutdown failed", error);
      process.exitCode = 1;
    }
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
