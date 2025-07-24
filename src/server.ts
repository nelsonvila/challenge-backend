import Fastify from "fastify";
import healthRoutes from "./routes/health";
import { initDb } from "./services/db";

export default async function startServer() {
  const app = Fastify({ logger: true });

  await initDb();

  app.register(healthRoutes, { prefix: "/health" });

  return app;
}
