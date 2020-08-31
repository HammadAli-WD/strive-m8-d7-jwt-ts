import { Request, Response, NextFunction } from 'express'
import { MyError } from './custom'

// ERROR HANDLERS
export const badRequestHandler = (
  err: MyError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err.httpStatusCode === 400) {
    res.status(400).send(err.message)
  }
  next(err)
} // 400

export const forbiddenHandler = (err: MyError, req: Request, res: Response, next: NextFunction) => {
  if (err.httpStatusCode === 403) {
    res.status(403).send(err.message || 'Forbidden!')
  }
  next(err)
} // 403

export const notFoundHandler = (err: MyError, req: Request, res: Response, next: NextFunction) => {
  if (err.httpStatusCode === 404) {
    res.status(404).send(err.message || 'Resource not found!')
  }
  next(err)
} // 404

// catch all
export const genericErrorHandler = (
  err: MyError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!res.headersSent) {
    // checks if another error middleware already sent a response
    res.status(err.httpStatusCode || 500).send(err.message)
  }
}
