import type { Request, Response, RequestHandler } from 'express';
import { TokenType } from '@prisma/client';
import httpStatus from 'http-status';
import config from 'config';
import bcrypt from 'bcryptjs';

import type {
    ForgotPasswordInput,
    RegisterInput,
    UpdatePasswordInput,
    VerifyEmailInput,
} from './auth.schema';
import {
    sendForgotPasswordLink,
    sendPasswordUpdatedSuccessfully,
    sendVerificationEmail,
} from '@/lib';
import { bcryptCompare } from '@/utils';
import * as services from './auth.services';

const SALT_ROUNDS = config.get<string>('SALT_ROUNDS');

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
    const PASSWORD_RESET_BASE_URL = config.get<string>('PASSWORD_RESET_BASE_URL');

    const user = await services.findUser({ email });

    if (user === null) {
        return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: 'User not found',
        });
    }

    // delete existing token if any
    await services.findTokenAndDelete(user.id, TokenType.RESET_PASSWORD);

    // generate link
    const token = await services.generateResetPasswordToken(user.id, TokenType.RESET_PASSWORD);

    const resetLink = `${PASSWORD_RESET_BASE_URL}?token=${token}&userId=${user.id}`;

    sendForgotPasswordLink({
        email: user.email,
        link: resetLink,
    });

    return res.status(httpStatus.OK).json({
        success: true,
        message: 'Reset password link sent successfully, please check your registered  email',
    });
};

export const tokenIsValid: RequestHandler = async (req: Request, res: Response) => {
    return res.status(httpStatus.OK).json({
        success: true,
        message: 'Token is valid',
        valid: true,
    });
};

export const updatePassword: RequestHandler = async (
    req: Request<any, any, UpdatePasswordInput>,
    res: Response
) => {
    const { password, userId } = req.body;

    const user = await services.findUserById(userId);

    if (user === null) {
        return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: 'User not found',
        });
    }

    const isMatch = await bcryptCompare(password, user.password);

    if (isMatch) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: 'New password cannot be same as old password',
        });
    }

    const hashedPassword = await bcrypt.hash(password, Number(SALT_ROUNDS));

    await services.findUserAndUpdate(userId, { password: hashedPassword });
    await services.findTokenAndDelete(userId, TokenType.RESET_PASSWORD); // delete token if exists

    sendPasswordUpdatedSuccessfully(user.name, user.email);

    return res.status(httpStatus.OK).json({
        success: true,
        message: 'Password updated successfully, check your email',
    });
};
