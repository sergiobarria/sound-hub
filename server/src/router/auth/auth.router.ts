import express from 'express';

import { register } from './auth.controller';
import { validate } from '@/middleware';
import { registerSchema } from './auth.schema';

const router = express.Router();

router.post('/register', validate(registerSchema), register);

export { router as authRouter };
