import AppError from "../util/appError.js";

const handleCastErrorDB = err => {
  const message  = `Invalid ${err.path}: ${err.value}`
  return new AppError(message, 400)
}

const handleDuplicateFieldsDB = err => {
  const message  = `Duplicate field value: ${err.keyValue.name}. Please use another value`
  return new AppError(message, 400)
}

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message)
  
  const message  = `Invalid input data: ${errors.join('. ')}`
  return new AppError(message, 400)
}

const handleJWTError = () => new AppError('Invalid token, please log in again.', 401)
const handleJWTExpiredError = () => new AppError('Token has expired, please log in again.', 401)

const sendErrorDev = (err, res, req) => {
  //API A)
  if(req.originalUrl.startsWith('/api')){
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    })
  } 
    // B) RENDERED WEBSITE
    console.error('ERROR :( ', err)
    return res.status(err.statusCode).render('error', { 
      title: 'Something went wrong',
      msg: err.message
    })
}

const sendErrorProd = (err, req, res) => {
  if(req.originalUrl.startsWith('/api')){
    // A) API
    // Operational. trusted error: send message to client
    console.log(err)
    if(err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      })
  
      //Programing or other unknown error: do not leak error details
    } 
      //1) Log error
      console.error('ERROR :( ', err)
      //2) Send generic message
      return res.status(500).json({
        status: 'error',
        message: 'Somethign went very wrong'
      })
  } 
    // B) RENDERED WEBSITE
    if(err.isOperational) {
      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message
      })
  
      //Programing or other unknown error: do not leak error details
    } 
      //1) Log error
      console.error('ERROR :( ', err)
      //2) Send generic message
      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: 'Please try again later'
      })
}



export default (err,req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'
 
  if(process.env.NODE_ENV === 'development') {
   sendErrorDev(err, res, req)

  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err)

    if (err.name === 'CastError') error = handleCastErrorDB(err)
    if (err.code === 11000) error = handleDuplicateFieldsDB(err)
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err)
    if(err.name === 'JsonWebTokenError') error = handleJWTError() 
    if(err.name === 'TokenExpiredError') error = handleJWTExpiredError() 
    sendErrorProd(error, req, res)
  }
}

