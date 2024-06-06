import dotenv from "dotenv";
import connectDB from './db/index.js'
import { app } from './app.js'

dotenv.config({
  path: './.env'
})

const port = process.env.PORT || 3000

connectDB()
  .then(() => {
    app
      .listen(port, () => {
        console.log('Server is running on port', port)
      })
      .on('error', (err) => {
        console.error('Server failed to start:', err)
      })
  })
  .catch((err) => console.log(`MongoDB connection Failed: `, err))
