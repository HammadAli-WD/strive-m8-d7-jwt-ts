import { Request } from 'express'
import { User } from './services/users/schema'

export interface MyError extends Error {
  httpStatusCode?: number
  code?: number
}

export interface MyRequest extends Request {
  user?: User
}
