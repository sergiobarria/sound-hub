import type { Prisma, User } from '@prisma/client';

import { prisma } from '@/lib';
import type { RegisterInput } from './auth.schema';
import { APIError } from '@/utils';

export async function create(data: Omit<RegisterInput, 'passwordConfirm'>): Promise<User | null> {
    const user = await prisma.user.create({
        data,
    });

    if (user === null) {
        throw APIError.internal('Failed to create user');
    }

    return user;
}
