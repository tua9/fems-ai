import express from 'express'
import dotenv from 'dotenv'
import { mastra } from './src/mastra/index.js'
import { MastraServer } from '@mastra/express'
import mongoose from 'mongoose'

dotenv.config()

const app = express()
app.use(express.json({ limit: '10mb' }))

// Kết nối Mongo một lần
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err))

// Khởi tạo Mastra server (tự động thêm route nếu cần)
const mastraServer = new MastraServer({ app, mastra })
mastraServer.init()

//END POINT CHAT
app.post('/api/agent/chat', async (req, res) => {
  const { message, userId = 'guest', userType = 'student' } = req.body

  if (!message) {
    return res.status(400).json({ error: 'Thiếu message' })
  }

  try {
    const agent = mastra.getAgent('schoolAgent') // hoặc 'school-helper' tùy bạn đã sửa trước

    const result = await agent.generate(message, {
      threadId: userId, // ID cuộc trò chuyện (dùng userId để nhớ theo user)
      resourceId: userId, // Scope theo user (quan trọng để memory hoạt động đúng)
      metadata: {
        // ← Dùng metadata để truyền info user
        userType,
        // thêm info khác nếu cần, ví dụ: role: userType
      },
    })

    res.json({
      reply: result.text || result.content || 'Không có phản hồi',
      toolCalls: result.toolCalls || [],
      done: result.done || true,
    })
  } catch (err) {
    console.error('Lỗi khi gọi agent:', err)
    res.status(500).json({ error: err.message || 'Lỗi AI, thử lại sau' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`)
  console.log(
    'Test: POST /api/agent/chat với { "message": "Mượn máy chiếu phòng 101" }',
  )
})
