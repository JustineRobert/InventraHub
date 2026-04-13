import dotenv from 'dotenv';
import app from './app';
import logger from './utils/logger';

dotenv.config();

const port = Number(process.env.PORT || 4000);

app.listen(port, () => {
  logger.info(`InventraHub backend running on http://localhost:${port}`);
});
