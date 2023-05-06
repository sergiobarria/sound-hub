import type { NextFunction, Request, RequestHandler, Response } from 'express';
import httpStatus from 'http-status';

import { bcryptCompare } from '@/utils';
import type { VerifyTokenInput } from '@/router/auth/auth.schema';
import { findToken } from '@/router/auth/auth.services';

export const verifyToken: RequestHandler = async (
    req: Request<any, any, VerifyTokenInput>,
    res: Response,
    next: NextFunction
) => {
    const { token, userId, type } = req.body;

    const resetPasswordToken = await findToken({ ownerId: userId, type });

    if (resetPasswordToken === null) {
        return res.status(httpStatus.UNAUTHORIZED).json({
            success: false,
            message: 'Unauthorized, invalid token',
        });
    }

    const isMatch = await bcryptCompare(token, resetPasswordToken.token);

    console.log({ isMatch, token, resetPasswordToken });

    if (!isMatch) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: 'Invalid token',
        });
    }

    next();
};
