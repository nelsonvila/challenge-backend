import { parentPort, workerData } from 'worker_threads';
import sql from 'mssql';
import { Cliente } from '../models/cliente';
import logger from '../utils/logger';

const config: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST || '',
  database: process.env.DB_NAME || 'ChallengeDB',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

(async () => {
  logger.info('Worker DB config:', config);
  const pool = await sql.connect(config);
  

  // Prepara tabla para bulk insert
  const table = new sql.Table('dbo.Clientes');
  table.create = false; // <-- Indica que la tabla ya existe
  table.columns.add('Id', sql.VarChar(6), { nullable: false });
  table.columns.add('Nombre', sql.NVarChar(100), { nullable: false });
  table.columns.add('Apellido', sql.NVarChar(100), { nullable: false });
  table.columns.add('Email', sql.NVarChar(200), { nullable: true });
  table.columns.add('Edad', sql.Int, { nullable: true });

  for (const line of workerData as string[]) {
    const parts = line.split('|');
    // Filtra líneas corruptas
    if (parts.length !== 5 || (parts[4] && isNaN(Number(parts[4])))) continue;
    const cliente: Cliente = {
      id: parts[0],
      nombre: parts[1],
      apellido: parts[2],
      email: parts[3] || null,
      edad: parts[4] ? parseInt(parts[4], 10) : null,
    };
    table.rows.add(
      cliente.id,
      cliente.nombre,
      cliente.apellido,
      cliente.email,
      cliente.edad
    );
  }

  try {
    await pool.request().bulk(table);
    logger.info(`Inserted batch of ${table.rows.length} clientes`);
    parentPort!.postMessage({ success: true });
  } catch (err) {
    logger.error('Error inserting batch:', err);
    parentPort!.postMessage({ error: (err as Error).message });
  } finally {
    pool.close();
  }
})();