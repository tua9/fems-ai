// server.js
import express from 'express'
import { MastraServer } from '@mastra/express'
import { mastra } from './src/mastra/index.js'
import connectDB from './src/config/db.js'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

// Kết nối DB trước
await connectDB()

// Khởi động Mastra
const mastraServer = new MastraServer({
  app,
  mastra,
})

await mastraServer.init()

console.log('Mastra init xong')

app.get('/', (req, res) => {
  res.send('Server + Mastra Agent + MongoDB đang chạy!')
})

app.listen(PORT, () => {
  console.log(`Server chạy: http://localhost:${PORT}`)
  console.log(
    `Test agent: POST http://localhost:${PORT}/api/agents/equipment-agent`,
  )
})
