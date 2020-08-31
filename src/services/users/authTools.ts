import { sign, verify } from 'jsonwebtoken'
import UserModel from './schema'
import { User } from './schema'

export const refreshToken = async (oldRefreshToken: string) => {
  // verify oldRefreshToken
  console.log('DECODED ', oldRefreshToken)
  const decoded: any = await verifyRefreshToken(oldRefreshToken)

  const user = await UserModel.findOne({ _id: decoded._id })

  if (!user) {
    throw new Error(`Access is forbidden`)
  }

  const currentRefreshToken = user.refreshTokens.find(t => t.token === oldRefreshToken)

  if (!currentRefreshToken) {
    throw new Error(`Refresh token is wrong`)
  }

  // generate tokens
  const newAccessToken = await generateJWT({ _id: user._id })
  const newRefreshToken = await generateRefreshJWT({ _id: user._id })

  // save in db
  const newRefreshTokens = user.refreshTokens
    .filter(t => t.token !== oldRefreshToken)
    .concat({ token: newRefreshToken })

  user.refreshTokens = [...newRefreshTokens]

  console.log(user.refreshTokens)

  await user.save()

  return { token: newAccessToken, refreshToken: newRefreshToken }
}

export const authenticate = async (user: User) => {
  try {
    // generate tokens
    const newAccessToken = await generateJWT({ _id: user._id })
    const newRefreshToken = await generateRefreshJWT({ _id: user._id })

    user.refreshTokens = user.refreshTokens.concat({ token: newRefreshToken })
    await user.save()

    return { token: newAccessToken, refreshToken: newRefreshToken }
  } catch (error) {
    console.log(error)
    throw new Error(error)
  }
}

const generateJWT = (payload: any) =>
  new Promise<string>((res, rej) =>
    sign(payload, process.env.JWT_SECRET!, { expiresIn: '16m' }, (err, token) => {
      if (err) { rej(err) }
      res(token)
    }),
  )

// const verifyJWT = (token: string) =>
//   new Promise<any>((res, rej) =>
//     verify(token, process.env.JWT_SECRET!, (err, decoded) => {
//       if (err) rej(err)
//       res(decoded)
//     })
//   )

const generateRefreshJWT = (payload: any) =>
  new Promise<string>((res, rej) =>
    sign(payload, process.env.REFRESH_JWT_SECRET!, { expiresIn: '1 week' }, (err, token) => {
      if (err) { rej(err) }
      res(token)
    }),
  )

const verifyRefreshToken = (token: string) =>
  new Promise<any>((res, rej) =>
    verify(token, process.env.REFRESH_JWT_SECRET!, (err, decoded) => {
      if (err) { rej(err) }
      res(decoded)
    }),
  )
