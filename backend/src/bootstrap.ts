import { connectDb } from './utils/prisma';
import { connectRedis } from './utils/redis';

declare global {
  // eslint-disable-next-line no-var
  var __appBootstrapPromise: Promise<void> | undefined;
}

export async function bootstrapApplication(): Promise<void> {
  if (!global.__appBootstrapPromise) {
    global.__appBootstrapPromise = (async () => {
      await connectDb();
      await connectRedis();
    })().catch((error) => {
      global.__appBootstrapPromise = undefined;
      throw error;
    });
  }

  await global.__appBootstrapPromise;
}
