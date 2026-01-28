import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import logger from '../utils/logger';

export const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request body, query, and params merged or just body? 
        // Usually validation targets body. Query/Params can be separate.
        // For now, let's validate body for mutations.

        // Parse verifies the data against the schema
        schema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            // Map Zod issues to a user-friendly format
            const errors = error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));

            logger.warn('Zod Validation Failed:', {
                path: req.path,
                errors,
                body: req.body
            });

            return res.status(400).json({
                success: false,
                message: 'Validasyon hatası',
                errors
            });
        }
        next(error);
    }
};
