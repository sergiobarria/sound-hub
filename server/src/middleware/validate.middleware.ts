import type { Request, Response, NextFunction } from 'express';
import { type AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            next();
        } catch (error: any) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Invalid request data',
                    errors: error.flatten(),
                });
            }

            return res.status(500).json({
                status: 'error',
                message: error.message,
            });
        }
    };
};
