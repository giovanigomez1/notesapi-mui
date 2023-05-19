import express from "express";
import dotenv from 'dotenv'
import noteRoute from './routes/noteRoute.js'
import homeRoute from './routes/home.js'
import useRoute from './routes/userRoute.js'
import cors from 'cors'
import cookieParser from "cookie-parser";
import hemlet from 'helmet'
import morgan from "morgan";
import mongoSanitize from 'express-mongo-sanitize'
import rateLimit from "express-rate-limit";
import compression from "compression";
import xss from 'xss-clean'
import hpp from "hpp";
import globalErrorHandler from './controllers/errorController.js'
import path from 'path'
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({path: './config.env'})

const app = express()
app.enable('trust proxy')

app.use(express.static(path.join(__dirname, 'public'))) // to serve static files

app.use(cors({
  credentials: true,
  origin: 'https://notes-mui.vercel.app'
}))

app.options('*', cors())
app.use(xss())
app.use(hemlet())


console.log(process.env.NODE_ENV)
if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Limit request from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
})
app.use('/api', limiter)


// Body parser
app.use(express.json({limit: '10kb'}))
app.use(express.urlencoded({extended: true, limit: '10kb'}))
app.use(cookieParser())


// Data sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())
app.use(compression())

app.use('/', homeRoute)
app.use('/api/v1/users', useRoute)
app.use('/api/v1/notes', noteRoute)

app.use(globalErrorHandler)
export { app }

