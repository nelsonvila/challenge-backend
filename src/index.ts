import startServer from './server';
import fs from 'fs/promises';
import { watchDataDir } from './services/fileWatcher';
import { processFile } from './services/fileProcessor';
import logger from './utils/logger';

(async () => {
  const app = await startServer();

  // 1) Procesar al inicio todos los .dat existentes
  const files = await fs.readdir('./data');
  logger.info(`Found ${files.length} files in data directory.`);
  await Promise.all(
    files.filter(f => f.endsWith('.dat')).map(f => processFile(`data/${f}`))
  );

  // 2) Quedar a la escucha de nuevos archivos .dat
  watchDataDir('data');

  // 3) Arrancar el servidor HTTP
  await app.listen({ port: 3000, host: '0.0.0.0' });
  app.log.info('Servidor listening en http://0.0.0.0:3000');
})();
