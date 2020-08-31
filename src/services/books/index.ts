const express = require('express')
import { Response, NextFunction } from 'express'
import { MyRequest, MyError } from '../../custom'
import BookSchema from './schema'

const booksRouter = express.Router()

booksRouter.get('/', async (req: MyRequest, res: Response, next: NextFunction) => {
  try {
    const books = await BookSchema.find(req.query)
    res.send(books)
  } catch (error) {
    next(error)
  }
})

booksRouter.get('/:id', async (req: MyRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id
    const book = await BookSchema.findById(id)
    if (book) {
      res.send(book)
    } else {
      const error: MyError = new Error()
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    console.log(error)
    next('While reading books list a problem occurred!')
  }
})

booksRouter.post('/', async (req: MyRequest, res: Response, next: NextFunction) => {
  try {
    const newbook = new BookSchema(req.body)
    const { _id } = await newbook.save()

    res.status(201).send(_id)
  } catch (error) {
    next(error)
  }
})

booksRouter.put('/:id', async (req: MyRequest, res: Response, next: NextFunction) => {
  try {
    const book = await BookSchema.findByIdAndUpdate(req.params.id, req.body)
    if (book) {
      res.send('Ok')
    } else {
      const error: MyError = new Error(`book with id ${req.params.id} not found`)
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    next(error)
  }
})

booksRouter.delete('/:id', async (req: MyRequest, res: Response, next: NextFunction) => {
  try {
    const book = await BookSchema.findByIdAndDelete(req.params.id)
    if (book) {
      res.send('Deleted')
    } else {
      const error: MyError = new Error(`book with id ${req.params.id} not found`)
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    next(error)
  }
})

export default booksRouter
