// src/config/db.js
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    })

    console.log(`MongoDB Connected: ${mongoose.connection.host}`)

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB bị ngắt kết nối → đang thử kết nối lại...')
      connectDB()
    })
  } catch (error) {
    console.error('Kết nối MongoDB thất bại:', error.message)
    process.exit(1)
  }
}

export default connectDB
