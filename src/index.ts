import express from 'express'
import cors from 'cors'
import { join } from 'path'
import listEndpoints from 'express-list-endpoints'
import { connect } from 'mongoose'

import booksRouter from './services/books'
import usersRouter from './services/users'

import {
  notFoundHandler,
  forbiddenHandler,
  badRequestHandler,
  genericErrorHandler,
} from './errorHandlers'

const server = express()

server.use(cors())
const port = process.env.PORT

const staticFolderPath = join(__dirname, '../public')
server.use(express.static(staticFolderPath))
server.use(express.json())

server.use('/books', booksRouter)
server.use('/users', usersRouter)

// ERROR HANDLERS MIDDLEWARES

server.use(badRequestHandler)
server.use(forbiddenHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

console.log(listEndpoints(server))

connect(process.env.MONGO_CONNECTION_STRING!, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
})
  .then(() =>
    server.listen(port, () => {
      console.log('Running on port', port)
    }),
  )
  .catch(err => console.log(err))
