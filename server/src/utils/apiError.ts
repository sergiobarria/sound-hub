import httpStatus from 'http-status';

enum ErrorStatus {
    Fail = 'fail',
    Error = 'error',
}

export class APIError extends Error {
    public statusCode: number;
    public status: ErrorStatus;
    public isOperational: boolean;
    public meta?: Record<string, any>;
    public isPrismaError: boolean;

    constructor(
        message: string,
        statusCode: number,
        isPrismaError = false,
        meta?: Record<string, any>
    ) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? ErrorStatus.Fail : ErrorStatus.Error;
        this.isOperational = true;
        this.isPrismaError = isPrismaError;
        this.meta = meta;

        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message: string): APIError {
        return new APIError(message, httpStatus.BAD_REQUEST);
    }

    static unauthorized(message: string): APIError {
        return new APIError(message, httpStatus.UNAUTHORIZED);
    }

    static forbidden(message: string): APIError {
        return new APIError(message, httpStatus.FORBIDDEN);
    }

    static notFound(message: string): APIError {
        return new APIError(message, httpStatus.NOT_FOUND);
    }

    static internal(message: string): APIError {
        return new APIError(message, httpStatus.INTERNAL_SERVER_ERROR);
    }

    static conflict(message: string): APIError {
        return new APIError(message, httpStatus.CONFLICT);
    }

    static notImplemented(message: string): APIError {
        return new APIError(message, httpStatus.NOT_IMPLEMENTED);
    }

    static serviceUnavailable(message: string): APIError {
        return new APIError(message, httpStatus.SERVICE_UNAVAILABLE);
    }
}
