import type { Request, Response, RequestHandler } from 'express';
import httpStatus from 'http-status';

import type { RegisterInput, VerifyEmailInput } from './auth.schema';
import { sendVerificationEmail } from '@/lib';
import { bcryptCompare } from '@/utils';
import * as services from './auth.services';

export const register: RequestHandler = async (
    req: Request<any, any, RegisterInput>,
    res: Response
) => {
    const { name, email, password } = req.body;

    const user = await services.insertUser({ name, email, password });
    const token = await services.generateToken(user.id as string);

    sendVerificationEmail(token, { name, email });

    return res.status(httpStatus.CREATED).json({
        success: true,
        message: 'User created successfully',
        data: { user },
    });
};

export const verififyEmail: RequestHandler = async (
    req: Request<any, any, VerifyEmailInput>,
    res: Response
) => {
    const { token, userId } = req.body;

    const verificationToken = await services.findToken({ ownerId: userId });

    if (verificationToken === null) {
        return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: 'Verification token not found',
        });
    }

    const isMatch = await bcryptCompare(token, verificationToken.token);

    if (!isMatch) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: 'Invalid token',
        });
    }

    await services.findUserAndUpdate(userId, { isVerified: true });
    await services.findTokenAndDelete(verificationToken.id);

    return res.status(httpStatus.OK).json({
        success: true,
        message: 'Email verified successfully',
    });
};

export const sendVerificationToken: RequestHandler = async (
    req: Request<any, any, Omit<VerifyEmailInput, 'token'>>,
    res: Response
) => {
    const { userId } = req.body;

    const user = await services.findUserById(userId);

    if (user === null) {
        return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: 'User not found',
        });
    }

    // delete existing token if any
    await services.findTokenAndDelete(userId);

    // regenerate token
    const newToken = await services.generateToken(userId);

    // send verification email
    sendVerificationEmail(newToken, { name: user?.name, email: user?.email });

    return res.status(httpStatus.OK).json({
        success: true,
        message: 'Verification email sent successfully, please check your email',
    });
};
