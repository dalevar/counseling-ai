import app from '../src/app';
import { connectDb } from '../src/utils/prisma';
// import { ensureRedisConnection } from '../src/utils/redis';

let bootstrapPromise: Promise<void> | null = null;

const bootstrap = async (): Promise<void> => {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await connectDb();
      // await ensureRedisConnection();
    })().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }

  await bootstrapPromise;
};

export default async function handler(req: any, res: any): Promise<void> {
  await bootstrap();

  await new Promise<void>((resolve, reject) => {
    res.on('finish', resolve);
    res.on('close', resolve);
    res.on('error', reject);

    app(req, res);
  });
}
