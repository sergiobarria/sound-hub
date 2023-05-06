import express from 'express';

import { register, verififyEmail } from './auth.controller';
import { validate } from '@/middleware';
import { registerSchema, verifyEmailSchema } from './auth.schema';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/verify-email', validate(verifyEmailSchema), verififyEmail);

export { router as authRouter };
