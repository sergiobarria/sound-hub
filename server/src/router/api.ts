import express, { type Request, type Response } from 'express';
import httpStatus from 'http-status';

import { apiConfig } from '@/constants';
import { authRouter } from './auth/auth.router';

export const routerV1 = express.Router();

routerV1.get('/healthcheck', (_: Request, res: Response) => {
    res.status(httpStatus.OK).json({
        succes: true,
        message: 'server is up and running',
        details: {
            version: apiConfig.version,
            name: apiConfig.name,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
        },
    });
});

// ===== Register API routes here 👇🏼 =====
routerV1.use('/auth', authRouter);
