import fs from 'fs';
import readline from 'readline';
import { Worker } from 'worker_threads';
import path from 'path';
import logger  from '../utils/logger';

const BATCH_SIZE = 1000;
const MAX_CONCURRENT = 4;

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST || '',
  database: process.env.DB_NAME || 'ChallengeDB',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

function runBatchWorker(batch: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.resolve(__dirname, './batchWorker.js'), {
      workerData: { batch, config }
    });
    worker.on('message', msg => {
      if (msg === 'done') resolve();
      else if (msg && msg.error) reject(new Error(msg.error));
    });
    worker.on('error', reject);
    worker.on('exit', code => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}

export async function processFile(filePath: string): Promise<void> {
  const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let batch: string[] = [];
  const batchQueue: Promise<void>[] = [];

  for await (const line of rl) {
    batch.push(line);
    if (batch.length >= BATCH_SIZE) {
      if (batchQueue.length >= MAX_CONCURRENT) {
        await Promise.race(batchQueue);
      }
      batchQueue.push(
        runBatchWorker(batch).catch(err => {
          logger.error(`[BatchWorker] Error en batch: ${err.message}`);
        })
      );
      batch = [];
    }
  }
  if (batch.length) {
    batchQueue.push(
      runBatchWorker(batch).catch(err => {
        logger.error(`[BatchWorker] Error en batch: ${err.message}`);
      })
    );
  }
  await Promise.all(batchQueue);
}