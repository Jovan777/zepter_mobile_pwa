import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true);

  await mongoose.connect(env.MONGO_URI, {
    autoIndex: env.NODE_ENV !== 'production'
  });

  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
