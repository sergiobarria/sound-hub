import morgan, { type StreamOptions } from 'morgan';
import chalk from 'chalk';

import { logger } from '@/utils';

const stream: StreamOptions = {
    write: (message: string): void => {
        logger.http(message.trim());
    },
};

const skip = (): boolean => {
    const env = process.env.NODE_ENV ?? 'development';
    return env !== 'development';
};

export const morganMiddleware = morgan(
    chalk`{greenBright.bold.underline :method} {blueBright.bold :url} {yellowBright.bold :status} {redBright.bold :response-time ms}`,
    {
        stream,
        skip,
    }
);
