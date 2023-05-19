import mongoose from 'mongoose'
import dotenv from 'dotenv'

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION, Shutting down the server bye...')
  console.log(err.name, err.message)
  process.exit(1)
})


dotenv.config({path: './config.env'})
import { app } from './app.js'

const port = process.env.PORT
const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD).replace('<username>', process.env.DATABASE_USER)

mongoose.connect(DB, {
  useUnifiedTopology: true, 
  useNewUrlParser: true,
  autoIndex: true
}).then(() => {
  console.log('DataBase connected successfully...')
}).catch((err) => console.log('There was an error while connecting to the database', err))


const server = app.listen(port, () => {
  console.log(`App running at port ${port}`)
})


process.on('unhandledRejection', err => {
  console.log(err.name, err.message)
  console.log('Unhandle Rejection, shutting down the server...')
  server.close(() => {
    process.exit(1)
  })
})


process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down the gracefully...')
  server.close(() => {
    console.log('Process termiated')
  })
})