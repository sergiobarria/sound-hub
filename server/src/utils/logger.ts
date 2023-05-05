import * as winston from 'winston';
import config from 'config';

const ENV = config.get<string>('NODE_ENV');

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
};

const level = (): string => {
    const isDevelopment = ENV === 'development';
    return isDevelopment ? 'verbose' : 'warn';
};

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'blue',
    http: 'magenta',
    verbose: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info: Record<string, string>) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

const transports = [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/all.log' }),
];

export const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports,
});
