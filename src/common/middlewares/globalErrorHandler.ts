import { NextFunction, Request, Response } from 'express'
import { HttpError } from 'http-errors'
import logger from '../../config/logger'
import { v4 as uuid } from 'uuid'

export const globalErrorHandler = (
    err: HttpError,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction,
) => {
    const errorId = uuid()
    const statusCode = err.statusCode || 500

    const isProduction = process.env.NODE_ENV === 'production'

    const message = isProduction ? 'Internal server error' : err.message

    logger.error(err.message, {
        id: errorId,
        status: statusCode,
        error: err.stack,
        method: req.method,
        path: req.path,
    })

    res.status(statusCode).json({
        errors: [
            {
                ref: errorId,
                type: err.name,
                message,
                method: req.method,
                path: req.path,
                location: 'server',
                stack: isProduction ? null : err.stack,
            },
        ],
    })
}
