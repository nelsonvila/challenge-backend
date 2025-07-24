// src/services/fileWatcher.ts
import chokidar from 'chokidar';
import path from 'path';
import logger from '../utils/logger';
import { processFile } from './fileProcessor';

/**
 * Observa un directorio y dispara processFile
 * cada vez que aparece un nuevo archivo .dat
 */
export function watchDataDir(dir: string) {
  const watcher = chokidar.watch(path.resolve(dir), {
    persistent: true,
    ignoreInitial: true,
    depth: 0,
  });

  watcher.on('add', filePath => {
    if (filePath.endsWith('.dat')) {
      logger.info(`Nuevo archivo detectado: ${filePath}`);
      try {
        processFile(filePath);
      } catch (err) {
        logger.error(`Error al procesar ${filePath}: ${(err as Error).message}`);
      }
    }
  });

  watcher.on('error', error => {
    logger.error(`Watcher error en ${dir}: ${(error as Error).message}`);
  });

  logger.info(`Watching directory for .dat files: ${dir}`);
}
