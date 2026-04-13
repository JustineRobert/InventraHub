import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import morgan from 'pino-http';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import businessRoutes from './routes/business';
import inventoryRoutes from './routes/inventory';
import ordersRoutes from './routes/orders';
import paymentsRoutes from './routes/payments';
import reportsRoutes from './routes/reports';
import uploadRoutes from './routes/upload';
import { errorHandler } from './middleware/errorHandler';
import logger from './utils/logger';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan({ logger }));

const uploadDirectory = process.env.UPLOAD_DIR || 'uploads';
app.use(`/uploads`, express.static(path.resolve(uploadDirectory)));

app.get('/health', (_req, res) => res.json({ status: 'ok', version: process.env.npm_package_version || '0.1.0' }));

app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/uploads', uploadRoutes);

app.use(errorHandler);

export default app;
