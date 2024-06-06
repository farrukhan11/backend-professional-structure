import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js'

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    console.log(`MongoDB connected with ${DB_NAME}`)
  } catch (error) {
    console.log(`MongoDB connection error ${error}`)
  }
}
export default connectDB
