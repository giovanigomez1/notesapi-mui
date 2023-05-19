import { promisify } from 'util'
import User from '../models/userModel.js'
import catchAsync from '../util/catchAsync.js'
import jwt from 'jsonwebtoken'
import AppError from '../util/appError.js'


const signToken = id => {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

const createSendToken = (user, statusCode, req, res, logout) => {
  // If the logout parameter is present the cookie will be sent with 1 second of expiration.
  const token = signToken(user._id)
  const cookieOptions = {
    expires: !logout ? new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000) : new Date(Date.now() + 10 + 1000),
    httpOnly: true,
    // sameSite: 'lax',
    sameSite: 'none', //-- production only
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  }

  if(process.env.NODE_ENV === 'production') cookieOptions.secure = true
  
  res.cookie('jwt', token, cookieOptions)
  if (user) user.password = undefined

  res.status(statusCode).json({
    status: 'success', 
    token,
    data: {
      user
    }
  })
}


export const signup = catchAsync(async(req, res, next) => {
  console.log(req.body)
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  })
  createSendToken(newUser, 201, req, res)
})


export const login = catchAsync(async(req, res, next) => {
  const {email, password} = req.body
  if(!email || !password) return next(new AppError('Please provide an email and password', 400))

  const user = await User.findOne({email}).select('+password')
  if(!user || !await user.correctPassword(password, user.password)) return next(new AppError('Incorrect email or password', 401))

  createSendToken(user, 200, req, res)
})


export const logout = catchAsync(async(req, res) => {

  const token = req.cookies.jwt
  if(!token) {
    res.status(200).json({
      status: 'No user logged',
      data: null
    })
    return 
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
  const currentUser = await User.findById(decoded.id)
  createSendToken(currentUser, 200, req, res, 'logout')
})


export const protect = catchAsync(async(req, res, next) => {
  console.log(req.cookies)
  let token
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt
  }
  if(!token) {
    return next(new AppError('Your session expired, please log in to get access', 401))
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
  const currentUser = await User.findById(decoded.id)
  if(!currentUser) {
    return next(new AppError('The user belonging to this token does not longer exist', 401))
  }
  if(currentUser.changePasswordAfter(decoded.iat)) {
    return next(new AppError('A user recently changed password, please log in again', 401))
  }
  req.user = currentUser
  res.locals.user = currentUser
  next()
})



export const isLoggedIn = catchAsync(async(req, res, next) => {
  const token = req.cookies.jwt
  if(!token) {
    res.status(200).json({
      status: 'No user logged',
      data: null
    })
    return 
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
  const currentUser = await User.findById(decoded.id)
  if(!currentUser) {
    res.status(401).json({
      status: 'fail',
      data: null
    })
    return
  }
  res.status(200).json({
    status: 'success',
    data: {
      currentUser
    }
  })
})


export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if(!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permision to perform this action', 401))
    }
    next()
  }
}

