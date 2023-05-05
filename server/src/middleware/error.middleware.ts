import type { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import config from 'config';

import type { APIError } from '@/utils';

export const globalErrorMiddleware = async (
    err: APIError,
    _: Request,
    res: Response,
    next: NextFunction
): Promise<Response> => {
    const NODE_ENV = config.get<string>('NODE_ENV');
    err.statusCode = err.statusCode ?? httpStatus.INTERNAL_SERVER_ERROR;
    err.status = err.status ?? 'error';

    if (err.isPrismaError) {
        // TODO: handle prisma errors
        // err.meta = err.meta as PrismaClientKnownRequestError;
    }

    if (NODE_ENV === 'development') {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack: err.stack,
            meta: err.meta,
        });
    } else {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
};
