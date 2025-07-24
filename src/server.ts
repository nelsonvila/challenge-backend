import Fastify from 'fastify';
import healthRoutes from './routes/health';

export default async function startServer() {
  const app = Fastify({ logger: true });

  app.register(healthRoutes, { prefix: '/health' });

  return app;
}
