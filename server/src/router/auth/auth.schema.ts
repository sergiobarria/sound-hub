import { z } from 'zod';

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

export type RegisterInput = z.infer<typeof registerSchema>['body'];
