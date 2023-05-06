import type { Request, Response, NextFunction, RequestHandler } from 'express';
import httpStatus from 'http-status';

import type { RegisterInput } from './auth.schema';
import { sendVerificationEmail } from '@/lib';
import * as services from './auth.services';

export const register: RequestHandler = async (
    req: Request<any, any, RegisterInput>,
    res: Response,
    next: NextFunction
) => {
    const { name, email, password } = req.body;

    const user = await services.insertOne({ name, email, password });
    const token = await services.generateToken(user.id as string);

    sendVerificationEmail(token, { name, email });

    return res.status(httpStatus.OK).json({
        success: true,
        message: 'User created successfully',
        data: { user },
    });
};
