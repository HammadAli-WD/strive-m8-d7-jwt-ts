import { Schema, Document, Model, model } from 'mongoose'
import { hash, compare } from 'bcryptjs'
import { MyError } from '../../custom'

export interface User extends Document {
  name: string
  surname: string
  password: string
  email: string
  role: string
  age: number
  refreshTokens: {
    token: string
  }[]
}

export interface UserModel extends Model<User> {}

const UserSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      required: true,
    },
    age: {
      type: Number,
      min: [18, 'You are toooooo young!'],
      max: [65, 'You are toooooo old!'],
    },
    refreshTokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
)

UserSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  delete userObject.password
  delete userObject.__v

  return userObject
}
UserSchema.statics.findByCredentials = async (email: string, password: number) => {
  const user = await UsersModel.findOne({ email })
  if (user) {
    const isMatch = await compare(password, user.password)
    if (!isMatch) {
      const err: MyError = new Error('Unable to login')
      err.httpStatusCode = 401
      throw err
    }
    return user
  }
}

// Hash the plain text password before saving
UserSchema.pre<User>('save', async function (next) {
  const user = this

  if (user.isModified('password')) {
    user.password = await hash(user.password, 8)
  }

  next()
})

UserSchema.post<User>('validate', function (error: MyError, doc: any, next: any) {
  if (error) {
    error.httpStatusCode = 400
    next(error)
  } else {
    next()
  }
})

UserSchema.post<User>('save', function (error: MyError, doc: any, next: any) {
  if (error.name === 'MongoError' && error.code === 11000) {
    error.httpStatusCode = 400
    next(error)
  } else {
    next()
  }
})

const UsersModel: UserModel = model('User', UserSchema)
export default UsersModel
