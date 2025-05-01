import dotenvFlow from 'dotenv-flow';
import { app } from './app';
import { serverListenerLogger } from './utils/helpers';
import logger from './utils/logger';

dotenvFlow.config();
const PORT = process.env.PORT || 8888;

app.listen(PORT, () => {
  logger.info(`🖧  Server is running on port ${PORT}`);
  serverListenerLogger(PORT);
});
