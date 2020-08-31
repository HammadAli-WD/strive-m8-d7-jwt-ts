const express = require('express')
const q2m = require('query-to-mongo')
import { authenticate, refreshToken } from './authTools'
const { authorize } = require('../middlewares/authorize')
import { Response, NextFunction } from 'express'
import { MyRequest, MyError } from '../../custom'

const UserModel = require('./schema')

const usersRouter = express.Router()

usersRouter.get('/', authorize, async (req: MyRequest, res: Response, next: NextFunction) => {
  try {
    const query = q2m(req.query)
    const users = await UserModel.find(query.criteria, query.options.fields)
      .skip(query.options.skip)
      .limit(query.options.limit)
      .sort(query.options.sort)

    res.send(users)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

usersRouter.get('/me', authorize, async (req: MyRequest, res: Response, next: NextFunction) => {
  try {
    res.send(req.user)
  } catch (error) {
    next('While reading users list a problem occurred!')
  }
})

usersRouter.post('/register', async (req: MyRequest, res: Response, next: NextFunction) => {
  try {
    const newUser = new UserModel(req.body)
    const { _id } = await newUser.save()

    res.status(201).send(_id)
  } catch (error) {
    next(error)
  }
})

usersRouter.put('/me', authorize, async (req: MyRequest, res: Response, next: NextFunction) => {
  try {
    req.user = { ...req.body }
    try {
      await req.user!.save()
      res.send(req.user)
    } catch (e) {
      res.status(400).send(e)
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.delete('/me', authorize, async (req: MyRequest, res: Response, next: NextFunction) => {
  try {
    await req.user!.remove()
    res.send('Deleted')
  } catch (error) {
    next(error)
  }
})

usersRouter.post('/login', async (req: MyRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body
    const user = await UserModel.findByCredentials(email, password)
    const tokens = await authenticate(user)
    res.send(tokens)
  } catch (error) {
    next(error)
  }
})

usersRouter.post(
  '/logout',
  authorize,
  async (req: MyRequest, res: Response, next: NextFunction) => {
    try {
      req.user!.refreshTokens = req.user!.refreshTokens.filter(
        (t: any) => t.token !== req.body.refreshToken,
      )
      await req.user!.save()
      res.send()
    } catch (err) {
      next(err)
    }
  },
)

usersRouter.post(
  '/logoutAll',
  authorize,
  async (req: MyRequest, res: Response, next: NextFunction) => {
    try {
      req.user!.refreshTokens = []
      await req.user!.save()
      res.send()
    } catch (err) {
      next(err)
    }
  },
)

usersRouter.post('/refreshToken', async (req: MyRequest, res: Response, next: NextFunction) => {
  const oldRefreshToken = req.body.refreshToken
  if (!oldRefreshToken) {
    const err: MyError = new Error('Forbidden')
    err.httpStatusCode = 403
    next(err)
  } else {
    try {
      const newTokens = await refreshToken(oldRefreshToken)
      res.send(newTokens)
    } catch (error) {
      console.log(error)
      const err: MyError = new Error(error)
      err.httpStatusCode = 403
      next(err)
    }
  }
})

export default usersRouter
