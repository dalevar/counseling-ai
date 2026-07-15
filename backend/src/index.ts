import express from 'express';
import app from './app';
import { bootstrapApplication } from './bootstrap';

const serverlessApp = express();

serverlessApp.use(async (_req, _res, next) => {
  try {
    await bootstrapApplication();
    next();
  } catch (error) {
    next(error);
  }
});

serverlessApp.use(app);

export default serverlessApp;
