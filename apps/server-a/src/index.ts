import Fastify from "fastify";
import cors from "@fastify/cors";
import { pingDatabase } from "@amzi-loci/database";
import type { HealthResponse, ApiInfoResponse } from "@amzi-loci/shared";
import { registerInsightRoutes } from "./routes/insights.js";
import { registerBrandKitRoutes } from "./routes/brandkit.js";
import { registerImageRoutes } from "./routes/images.js";
import { registerStudioRoutes } from "./routes/studio.js";
import { registerLicenseRoutes } from "./routes/license.js";
import { registerListingCopyRoutes } from "./routes/listing-copy.js";

const port = Number(process.env.PORT) || 3000;
const host = "0.0.0.0";

const app = Fastify({
  logger: process.env.NODE_ENV !== "test",
});

await app.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "X-Amzi-Provider-Key"],
});

await registerInsightRoutes(app);
await registerBrandKitRoutes(app);
await registerImageRoutes(app);
await registerStudioRoutes(app);
await registerLicenseRoutes(app);
await registerListingCopyRoutes(app);

app.get("/health", async (_request, reply) => {
  const dbConnected = await pingDatabase();

  const body: HealthResponse = {
    status: "ok",
    service: "amzi-loci",
    db: dbConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  };

  return reply.status(200).send(body);
});

app.get("/", async (_request, reply) => {
  const body: ApiInfoResponse = {
    message: "Amzi Loci API — Phase 8",
    service: "amzi-loci",
    version: "0.9.0",
  };

  return reply.status(200).send(body);
});

try {
  await app.listen({ port, host });
  app.log.info(`Amzi Loci API listening on http://${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
