import { parentPort, workerData } from 'worker_threads';
import sql from 'mssql';
import logger from '../utils/logger';

interface WorkerData {
  batch: string[];
  config: sql.config;
}

const { batch, config } = workerData as WorkerData;

(async () => {
  try {
    let corruptLines = 0;
    const pool = await sql.connect(config);
    logger.info('[Worker] Conexión exitosa');
    logger.info(`[Worker] DB config: ${JSON.stringify(config)}`);

    // Construir valores para el INSERT
    const values = batch
      .map((line, idx) => {
        const parts = line.split('|');
        if (parts.length !== 5 || (parts[4] && isNaN(Number(parts[4])))) {
          logger.warn(`[Worker] Línea corrupta ignorada en posición ${idx}: "${line}"`);
          corruptLines++;
          return null;
        }
        const [idRaw, nombreRaw, apellidoRaw, emailRaw, edadRaw] = parts;
        const id = `'${idRaw.replace(/'/g, "''")}'`;
        const nombre = `N'${nombreRaw.replace(/'/g, "''")}'`;
        const apellido = `N'${apellidoRaw.replace(/'/g, "''")}'`;
        const email = emailRaw ? `N'${emailRaw.replace(/'/g, "''")}'` : 'NULL';
        const edad = edadRaw ? parseInt(edadRaw, 10) : 'NULL';
        return `(${id},${nombre},${apellido},${email},${edad})`;
      })
      .filter(Boolean)
      .join(',');

    if (!values) {
      await pool.close();
      logger.info(`[Worker] Batch terminado: 0 registros insertados, ${corruptLines} líneas corruptas.`);
      parentPort?.postMessage('done');
      return;
    }

    const query = `
      INSERT INTO ${config.database}.dbo.Clientes (Id, Nombre, Apellido, Email, Edad)
      VALUES ${values};
    `;

    await pool.request().query(query);
    await pool.close();
    logger.info(`[Worker] Batch terminado: ${batch.length - corruptLines} registros insertados, ${corruptLines} líneas corruptas.`);
    parentPort?.postMessage('done');
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes('Violation of PRIMARY KEY constraint')) {
      logger.error(`[Worker] Clave duplicada: ${errorMsg}`);
      parentPort?.postMessage('done');
    } else {
      logger.error(`[Worker] Error en worker: ${errorMsg}`);
      parentPort?.postMessage({ error: errorMsg });
    }
  }
})();