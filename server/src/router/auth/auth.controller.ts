import type { Request, Response, NextFunction, RequestHandler } from 'express';
import httpStatus from 'http-status';

import type { RegisterInput } from './auth.schema';
import * as services from './auth.services';

export const register: RequestHandler = async (
    req: Request<any, any, RegisterInput>,
    res: Response,
    next: NextFunction
) => {
    const { name, email, password } = req.body;

    const user = await services.create({ name, email, password });

    return res.status(httpStatus.OK).json({
        success: true,
        message: 'User created successfully',
        data: { user },
    });
};
