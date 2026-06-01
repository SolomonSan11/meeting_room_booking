import express from 'express';
import { createApp } from './httpApp.js';
import { bootstrap } from './bootstrap.js';

bootstrap();

const app = createApp();

export default app;
