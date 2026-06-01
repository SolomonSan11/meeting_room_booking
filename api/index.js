import express from 'express';
import { createApp } from '../src/httpApp.js';
import { bootstrap } from '../src/bootstrap.js';

await bootstrap();

const app = createApp();

export default app;
