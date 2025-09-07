import express from 'express';
import cookieParser from 'cookie-parser';
import router from './routes/auth.routes.js';

const app = express();

// middlewares
app.use(express.json());
app.use(cookieParser());

// routes
app.use('/api/auth', router);

export { app };
