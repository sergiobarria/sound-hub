import type { Request, Response, RequestHandler } from 'express';
import httpStatus from 'http-status';
import { TokenType } from '@prisma/client';

import type { ForgotPasswordInput, RegisterInput, VerifyEmailInput } from './auth.schema';
import { sendForgotPasswordLink, sendVerificationEmail } from '@/lib';
import { bcryptCompare } from '@/utils';
import * as services from './auth.services';

export const register: RequestHandler = async (
    req: Request<any, any, RegisterInput>,
    res: Response
) => {
    const { name, email, password } = req.body;

    const user = await services.insertUser({ name, email, password });
    const token = await services.generateVerifyEmailToken(
        user.id as string,
        TokenType.VERIFY_EMAIL
    );

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

    console.log({ verificationToken: verificationToken.token, token, userId });

    const isMatch = await bcryptCompare(token, verificationToken.token);

    console.log({ isMatch });

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
    const newToken = await services.generateVerifyEmailToken(userId, TokenType.VERIFY_EMAIL);

    // send verification email
    sendVerificationEmail(newToken, { name: user?.name, email: user?.email });

    return res.status(httpStatus.OK).json({
        success: true,
        message: 'Verification email sent successfully, please check your email',
    });
};

export const forgotPassword: RequestHandler = async (
    req: Request<any, any, ForgotPasswordInput>,
    res: Response
) => {
    const { email } = req.body;

    const user = await services.findUser({ email });

    if (user === null) {
        return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: 'User not found',
        });
    }

    // delete existing token if any
    await services.findTokenAndDelete(user.id);

    // generate link
    const token = await services.generateResetPasswordToken(user.id, TokenType.RESET_PASSWORD);
    console.log({ token });
    const resetLink = `${req.protocol}://${req.get('host')}?token=${token}&userId=${user.id}`;

    sendForgotPasswordLink({
        email: user.email,
        link: resetLink,
    });

    return res.status(httpStatus.OK).json({
        success: true,
        message: 'Reset password link sent successfully, please check your registered  email',
    });
};
