import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('8h'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  UPLOAD_DIR: z.string().default('uploads'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  WHATSAPP_BUSINESS_API_URL: z.string().url().optional(),
  WHATSAPP_BUSINESS_TOKEN: z.string().optional(),
  WHATSAPP_BUSINESS_PHONE_NUMBER_ID: z.string().optional(),
  ANALYTICS_RUN_INTERVAL_MINUTES: z.coerce.number().positive().default(60)
});

const env = envSchema.parse(process.env);

export default {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  corsOrigins: env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
  uploadDir: env.UPLOAD_DIR,
  logLevel: env.LOG_LEVEL,
  whatsappApiUrl: env.WHATSAPP_BUSINESS_API_URL,
  whatsappToken: env.WHATSAPP_BUSINESS_TOKEN,
  whatsappPhoneNumberId: env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID,
  analyticsRunIntervalMinutes: env.ANALYTICS_RUN_INTERVAL_MINUTES
};
