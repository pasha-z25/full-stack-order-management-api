import dotenvFlow from 'dotenv-flow';
import 'reflect-metadata';

import { app } from './app';
import { initializeDataSource } from './db';
import { createDatabaseIfNotExists } from './utils/createDatabase';
import { serverListenerLogger } from './utils/helpers';
import logger from './utils/logger';

dotenvFlow.config();
const PORT = process.env.PORT || 8888;

const startServer = async () => {
  try {
    await createDatabaseIfNotExists(process.env.DB_NAME || 'test_db');

    initializeDataSource()
      .then(async () => {
        logger.info('📦 Database connected successfully');

        app.listen(PORT, () => {
          logger.info(`🖧  Server is running on port ${PORT}`);
          serverListenerLogger(PORT);
        });
      })
      .catch((error) => {
        logger.error('❌ Error connecting to database', {
          error: error.message,
        });
        process.exit(1);
      });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

startServer();
