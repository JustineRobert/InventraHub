import app from './app';
import logger from './utils/logger';
import config from './config';

app.listen(config.port, () => {
  logger.info(`InventraHub backend running on http://localhost:${config.port}`);
});
