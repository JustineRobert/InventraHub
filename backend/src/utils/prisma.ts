import { PrismaClient } from '@prisma/client';
import config from '../config';

const prisma = new PrismaClient({
  log: config.nodeEnv === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error']
});

export default prisma;
