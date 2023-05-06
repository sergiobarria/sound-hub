import { z } from 'zod';
import { ObjectId } from 'bson';

const payload = {
    body: z
        .object({
            name: z
                .string({
                    required_error: 'Name is required',
                })
                .trim(),
            email: z
                .string({
                    required_error: 'Email is required',
                })
                .email({
                    message: 'Email is invalid',
                }),
            password: z
                .string({
                    required_error: 'Password is required',
                })
                .min(8)
                .max(255),
            passwordConfirm: z.string({
                required_error: 'Password confirm is required',
            }),
        })
        .refine(data => data.password === data.passwordConfirm, {
            message: 'Passwords do not match',
            path: ['passwordConfirm'],
        }),
};

export const registerSchema = z.object({ ...payload });

export const verifyEmailSchema = z.object({
    body: z.object({
        token: z.string({
            required_error: 'Token is required',
        }),
        userId: z
            .string({
                required_error: 'User ID is required',
            })
            .refine(value => {
                return ObjectId.isValid(value);
            }, 'Not a valid MongoDB ObjectId'),
    }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>['body'];
