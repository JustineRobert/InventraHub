import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';
import morgan from 'pino-http';
import authRoutes from './routes/auth';
import businessRoutes from './routes/business';
import inventoryRoutes from './routes/inventory';
import ordersRoutes from './routes/orders';
import paymentsRoutes from './routes/payments';
import reportsRoutes from './routes/reports';
import branchesRoutes from './routes/branches';
import notificationsRoutes from './routes/notifications';
import forecastRoutes from './routes/forecast';
import uploadRoutes from './routes/upload';
import printableRoutes from './routes/printables';
import transactionRoutes from './routes/transactions';
import { errorHandler } from './middleware/errorHandler';
import logger from './utils/logger';
import config from './config';
import { startAnalyticsAggregationService } from './services/analytics';

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cookieParser());
app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(xss());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(morgan({ logger }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(apiLimiter);

const uploadDirectory = config.uploadDir;
fs.mkdirSync(path.resolve(uploadDirectory), { recursive: true });
app.use('/uploads', express.static(path.resolve(uploadDirectory), { dotfiles: 'deny', index: false, maxAge: '1d' }));

app.get('/health', (_req, res) => res.json({ status: 'ok', version: process.env.npm_package_version || '0.1.0' }));

app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/branches', branchesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/printables', printableRoutes);
app.use('/api/uploads', uploadRoutes);

if (config.nodeEnv !== 'test') {
  startAnalyticsAggregationService();
}

if (config.nodeEnv === 'production') {
  const clientApp = path.resolve('public');
  app.use(express.static(clientApp, { dotfiles: 'deny', index: false, maxAge: '1d' }));
  app.get('*', (_req, res) => res.sendFile(path.join(clientApp, 'index.html')));
}

app.use(errorHandler);

export default app;
