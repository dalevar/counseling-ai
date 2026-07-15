import app from '../src/app';
import { connectDb } from '../src/utils/prisma';

let bootstrapped = false;

export default async function handler(req: any, res: any) {
  try {
    if (!bootstrapped) {
      console.log('Connecting database...');
      await connectDb();

      bootstrapped = true;
      console.log('Bootstrap success');
    }

    return app(req, res);
  } catch (err: any) {
    console.error('BOOTSTRAP ERROR:', err);

    return res.status(500).json({
      success: false,
      message: err?.message,
      stack: process.env.NODE_ENV !== 'production' ? err?.stack : undefined,
    });
  }
}
