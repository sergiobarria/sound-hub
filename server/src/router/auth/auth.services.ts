import type { User } from '@prisma/client';
import { omit } from 'lodash';

import { prisma } from '@/lib';
import { APIError, generateOTPToken } from '@/utils';
import type { RegisterInput } from './auth.schema';

export async function insertOne(
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
