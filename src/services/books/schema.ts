import { Schema, Document, Model } from 'mongoose'
const mongoose = require('mongoose')
import { MyError } from '../../custom'

interface Book extends Document {
  _id: string
  title: string
  author: string
  description: string
  year: number
  genre: string[]
  price: number
}

const BookSchema = new Schema<Book>(
  {
    _id: {
      type: String,
    },
    title: String,
    author: String,
    description: String,
    year: Number,
    genre: Array,
    price: Number,
  },
  { _id: false },
)

export interface BookModel extends Model<Book> {}

BookSchema.post<Book>('validate', function (error: MyError, doc: any, next: any) {
  if (error) {
    error.httpStatusCode = 400
    next(error)
  } else {
    next()
  }
})

BookSchema.post<Book>('save', function (error: MyError, doc: any, next: any) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('There was a duplicate key error'))
  } else {
    next()
  }
})

const BooksModel: BookModel = mongoose.model('Book', BookSchema)
export default BooksModel
