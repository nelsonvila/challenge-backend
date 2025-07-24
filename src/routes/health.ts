import { FastifyInstance } from 'fastify';

export default async function (app: FastifyInstance) {
  app.get('/', async () => ({ status: 'ok', uptime: process.uptime() }));
}