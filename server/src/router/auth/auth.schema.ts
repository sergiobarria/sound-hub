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

export const validateTokenSchema = {
    body: z.object({
        token: z.string({
            required_error: 'Token is required',
        }),
        type: z.enum(['VERIFY_EMAIL', 'RESET_PASSWORD'], {
            required_error: 'Type is required',
        }),
        userId: z
            .string({
                required_error: 'User ID is required',
            })
            .refine(value => {
                return ObjectId.isValid(value);
            }, 'Not a valid MongoDB ObjectId'),
    }),
};

export const registerSchema = z.object({ ...payload });
export const verifyEmailSchema = z.object({ ...validateTokenSchema });
export const verifyTokenSchema = z.object({ ...validateTokenSchema });

export const resendVerificationTokenSchema = z.object({
    body: z.object({
        userId: z
            .string({
                required_error: 'User ID is required',
            })
            .refine(value => {
                return ObjectId.isValid(value);
            }, 'Not a valid MongoDB ObjectId'),
    }),
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z
            .string({
                required_error: 'Email is required',
            })
            .email({
                message: 'Email is invalid',
            }),
    }),
});

export const updatePasswordSchema = z.object({
    body: z
        .object({
            token: z.string({
                required_error: 'Token is required',
            }),
            type: z.enum(['VERIFY_EMAIL', 'RESET_PASSWORD']),
            userId: z.string({
                required_error: 'User ID is required',
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
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>['body'];
export type VerifyTokenInput = z.infer<typeof verifyTokenSchema>['body'];
