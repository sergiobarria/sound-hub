import type { EmailVerificationToken, Prisma, User } from '@prisma/client';
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

export async function findToken(
    where: Prisma.EmailVerificationTokenWhereInput
): Promise<EmailVerificationToken | null> {
    const token = await prisma.emailVerificationToken.findFirst({ where });

    return token;
}

export async function findUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });

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

export async function findTokenAndDelete(ownerId: string): Promise<void> {
    const token = await prisma.emailVerificationToken.findFirst({ where: { ownerId } });

    if (token === null) return;

    await prisma.emailVerificationToken.delete({ where: { ownerId } });
}

export async function generateToken(ownerId: string): Promise<string> {
    const otp = generateOTPToken();
    const verificationToken = await prisma.emailVerificationToken.create({
        data: {
            ownerId,
            token: otp,
        },
    });

    if (verificationToken === null) {
        throw APIError.internal('Failed to save verification token');
    }

    return otp;
}
