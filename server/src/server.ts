import { env } from './config/env';
import { connectDB } from './config/db';
import { app } from './app';

async function bootstrap(): Promise<void> {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`Zepter Mobile PWA API running on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start API:', error);
  process.exit(1);
});
