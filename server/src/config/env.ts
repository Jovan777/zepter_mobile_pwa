import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must have at least 10 characters').default('dev-secret-change-me'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().default('http://localhost:4200'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  POC_SEED_RESET: z.string().optional().default('false')
});

export const env = envSchema.parse(process.env);

export const allowedOrigins = env.CLIENT_URL.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
