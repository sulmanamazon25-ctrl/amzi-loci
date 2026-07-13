import type { FastifyInstance } from "fastify";
import type { ApplyBrandKitRequest } from "@amzi-loci/shared";
import { applyBrandKit, validateBrandKit } from "../lib/brandkit-prompt.js";

export async function registerBrandKitRoutes(app: FastifyInstance) {
  app.post<{ Body: ApplyBrandKitRequest }>("/brandkit/apply", async (request, reply) => {
    const { brandKit, productContext, insights } = request.body ?? {};
    const validationError = validateBrandKit(brandKit);
    if (validationError) {
      return reply.status(400).send({ error: validationError });
    }

    const result = applyBrandKit(brandKit!, productContext, insights);
    return reply.status(200).send(result);
  });
}
