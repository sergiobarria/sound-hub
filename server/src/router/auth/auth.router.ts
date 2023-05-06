import express from 'express';

import { forgotPassword, register, sendVerificationToken, verififyEmail } from './auth.controller';
import { validate } from '@/middleware';
import {
    forgotPasswordSchema,
    registerSchema,
    resendVerificationTokenSchema,
    verifyEmailSchema,
} from './auth.schema';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/verify-email', validate(verifyEmailSchema), verififyEmail);
router.post(
    '/resend-verification-token',
    validate(resendVerificationTokenSchema),
    sendVerificationToken
);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);

export { router as authRouter };
