import crypto from 'crypto';

import { TokenType, type Token, type Prisma, type User } from '@prisma/client';
import { omit } from 'lodash';

import { prisma } from '@/lib';
import { APIError, generateOTPToken } from '@/utils';
import type { RegisterInput } from './auth.schema';

export async function insertUser(
    data: Omit<RegisterInput, 'passwordConfirm'>
): Promise<Partial<User>> {
    const user = await prisma.user.create({
        data,
    });

    if (user === null) {
        throw APIError.internal('Failed to create user');
    }

    return omit(user, ['password']);
}

export async function findToken(where: Prisma.TokenWhereInput): Promise<Token | null> {
    const token = await prisma.token.findFirst({ where });

    return token;
}

export async function findUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });

    return user;
}

export async function findUser(where: Prisma.UserWhereInput): Promise<User | null> {
    const user = await prisma.user.findFirst({ where });

    return user;
}

export async function findUserAndUpdate(
    id: string,
    data: Prisma.UserUpdateInput
): Promise<User | null> {
    const user = await prisma.user.update({
        where: { id },
        data,
    });

    return user;
}

export async function findTokenAndDelete(
    ownerId: string,
    type: TokenType = TokenType.VERIFY_EMAIL
): Promise<void> {
    const token = await prisma.token.findFirst({ where: { ownerId, type } });

    if (token === null) return;

    await prisma.token.delete({ where: { ownerId } });
}

export async function generateVerifyEmailToken(
    ownerId: string,
    tokenType: TokenType
): Promise<string> {
    const otp = generateOTPToken();

    const verificationToken = await prisma.token.create({
        data: {
            ownerId,
            token: otp,
            type: tokenType,
        },
    });

    if (verificationToken === null) {
        throw APIError.internal('Failed to save verification token');
    }

    return otp;
}

export async function generateResetPasswordToken(
    ownerId: string,
    tokenType: TokenType
): Promise<string> {
    const token = crypto.randomBytes(36).toString('hex');

    const resetPasswordToken = await prisma.token.create({
        data: {
            ownerId,
            token,
            type: tokenType,
        },
    });

    if (resetPasswordToken === null) {
        throw APIError.internal('Failed to save reset password token');
    }

    return token;
}
