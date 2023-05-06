import express from 'express';

import {
    forgotPassword,
    register,
    sendVerificationToken,
    tokenIsValid,
    updatePassword,
    verififyEmail,
} from './auth.controller';
import { validate, verifyToken } from '@/middleware';
import {
    forgotPasswordSchema,
    registerSchema,
    resendVerificationTokenSchema,
    updatePasswordSchema,
    verifyEmailSchema,
    verifyTokenSchema,
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
router.post(
    '/verify-forgot-password-token',
    validate(verifyTokenSchema),
    verifyToken,
    tokenIsValid
);
router.patch('/update-password', validate(updatePasswordSchema), verifyToken, updatePassword);

export { router as authRouter };
