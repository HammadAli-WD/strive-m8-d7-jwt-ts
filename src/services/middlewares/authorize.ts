import { Response, NextFunction } from 'express'
import { MyRequest } from '../../custom'
const UserModel = require('../users/schema')
const { verifyJWT } = require('../users/authTools')
import { MyError } from '../../custom'

const authorize = async (req: MyRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')!.replace('Bearer ', '')
    const decoded = await verifyJWT(token)
    const user = await UserModel.findOne({
      _id: decoded._id,
    })

    console.log(user)

    if (!user) {
      throw new Error()
    }

    req.user = user
    next()
  } catch (e) {
    console.log(e)
    const err: MyError = new Error('Please authenticate')
    err.httpStatusCode = 401
    next(err)
  }
}

const adminOnlyMiddleware = async (req: MyRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') { next() }
  else {
    const err: MyError = new Error('Only for admins!')
    err.httpStatusCode = 403
    next(err)
  }
}

module.exports = { authorize, adminOnlyMiddleware }
