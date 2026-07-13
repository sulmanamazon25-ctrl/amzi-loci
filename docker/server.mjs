import Fastify from "fastify";
import cors from "@fastify/cors";

const port = Number(process.env.PORT) || 3000;
const host = "0.0.0.0";

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

app.get("/health", async (_request, reply) => {
  return reply.status(200).send({
    status: "ok",
    service: "amzi-loci",
    db: process.env.DATABASE_URL ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", async (_request, reply) => {
  return reply.status(200).send({
    message: "Amzi Loci API — Phase 0 MVP",
    service: "amzi-loci",
    version: "0.1.0",
  });
});

await app.listen({ port, host });
console.log(`Amzi Loci API listening on http://${host}:${port}`);
