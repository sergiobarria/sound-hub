import * as path from 'path';

import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import config from 'config';

import {
    morganMiddleware,
    globalErrorMiddleware,
    emailVerificationTokenMiddleware,
    userMiddleware,
} from './middleware';
import { APIError } from './utils';
import { envs } from './constants';
import { prisma } from './lib';
import { routerV1 } from './router/api';

export const app = express();

const NODE_ENV = config.get<string>('NODE_ENV');

// ===== Apply middlewares 👇🏼 =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(cors());

if (NODE_ENV === envs.DEVELOPMENT) {
    app.use(morganMiddleware);
}

// ===== Apply routes 👇🏼 =====
app.use('/api/v1', routerV1);

// Not found route handler
app.all('*', (req: Request, _: Response, next: NextFunction) => {
    next(APIError.notFound(`Cannot find ${req.originalUrl} on this server!`));
});

// ===== Apply error handler 👇🏼 =====
app.use(globalErrorMiddleware);

// ===== Apply prisma middlewares 👇🏼 =====
prisma.$use(emailVerificationTokenMiddleware);
prisma.$use(userMiddleware);
