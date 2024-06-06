import express from 'express' // Add quotes around express
import cors from 'cors'
import cookieParser from 'cookie-parser'

// Remove const app = express() from here
const app = express()

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
)

app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(express.static('public'))
app.use(cookieParser())

//routes import
import userRouter from './routes/user.routes.js'

//Routes decalaration
app.use('/api/users', userRouter)

export { app }
