import type { Prisma } from '@prisma/client';
import config from 'config';
import bcrypt from 'bcryptjs';

type PrismaNextFunc = (params: Prisma.MiddlewareParams) => Promise<any>;
const SALT_ROUNDS = config.get<string>('SALT_ROUNDS');

export async function userMiddleware(
    params: Prisma.MiddlewareParams,
    next: PrismaNextFunc
): Promise<void> {
    const collection = 'User';
    const { model, action, args } = params;

    // actions before creating a new user 👇🏼
    if (model === collection && action === 'create') {
        // hash user password before saving it to the database
        args.data.password = await bcrypt.hash(args.data.password, Number(SALT_ROUNDS));
    }

    // execute the original action 👇🏼
    const result = await next(params);

    // actions after creating a new user 👇🏼

    return result;
}

export async function emailVerificationTokenMiddleware(
    params: Prisma.MiddlewareParams,
    next: PrismaNextFunc
): Promise<void> {
    const collection = 'EmailVerificationToken';
    const { model, action, args } = params;

    // actions before creating a new email verification token 👇🏼
    if (model === collection && action === 'create') {
        // hash the token before saving it to the database
        args.data.token = await bcrypt.hash(args.data.token, Number(SALT_ROUNDS));
    }

    // execute the original action 👇🏼
    const result = await next(params);

    // actions after creating a new email verification token 👇🏼

    return result;
}
