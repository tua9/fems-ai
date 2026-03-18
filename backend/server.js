// server.js
import express from 'express'
import { MastraServer } from '@mastra/express'
import { mastra } from './src/mastra/index.js'
import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cors()) // Cho phép frontend gọi API

// ============================================================
// 🧠 In-Memory Session Store - Lưu lịch sử hội thoại
// Key: sessionId (string), Value: messages[] (array)
// ============================================================
const sessionStore = new Map()

// Tự động xóa session sau 30 phút không hoạt động
const SESSION_TTL_MS = 30 * 60 * 1000
const sessionTimers = new Map()

function resetSessionTimer(sessionId) {
  if (sessionTimers.has(sessionId)) {
    clearTimeout(sessionTimers.get(sessionId))
  }
  const timer = setTimeout(() => {
    sessionStore.delete(sessionId)
    sessionTimers.delete(sessionId)
    console.log(`[Session] Đã xóa session hết hạn: ${sessionId}`)
  }, SESSION_TTL_MS)
  sessionTimers.set(sessionId, timer)
}

// ============================================================
// 💬 POST /chat - Endpoint chat có nhớ lịch sử
// Body: { sessionId: string, message: string }
// ============================================================
app.post('/chat', async (req, res) => {
  try {
    const { sessionId, message } = req.body

    if (!sessionId || !message) {
      return res.status(400).json({
        error: 'Thiếu sessionId hoặc message',
      })
    }

    // Lấy lịch sử cũ (hoặc tạo mới nếu session chưa tồn tại)
    if (!sessionStore.has(sessionId)) {
      sessionStore.set(sessionId, [])
      console.log(`[Session] Tạo session mới: ${sessionId}`)
    }

    const history = sessionStore.get(sessionId)

    // Thêm tin nhắn mới của user vào lịch sử
    history.push({ role: 'user', content: message })

    console.log(`[Session ${sessionId}] Tổng messages: ${history.length}`)

    // Gọi agent với TOÀN BỘ lịch sử hội thoại
    const agent = mastra.getAgent('furniture-agent')
    const result = await agent.generate(history)

    console.log('\n\n\n result', result)

    const assistantMessage = result.text

    // Lưu phản hồi của AI vào lịch sử
    history.push({ role: 'assistant', content: assistantMessage })

    // Reset timer session
    resetSessionTimer(sessionId)

    return res.json({
      sessionId,
      text: assistantMessage,
      messageCount: history.length,
    })
  } catch (error) {
    console.error('[Chat Error]', error)
    return res.status(500).json({ error: error.message })
  }
})

// ============================================================
// 🗑️ DELETE /chat/:sessionId - Reset hội thoại
// ============================================================
app.delete('/chat/:sessionId', (req, res) => {
  const { sessionId } = req.params
  if (sessionStore.has(sessionId)) {
    sessionStore.delete(sessionId)
    if (sessionTimers.has(sessionId)) {
      clearTimeout(sessionTimers.get(sessionId))
      sessionTimers.delete(sessionId)
    }
    console.log(`[Session] Đã reset session: ${sessionId}`)
    return res.json({ success: true, message: `Đã xóa session ${sessionId}` })
  }
  return res.status(404).json({ error: 'Session không tồn tại' })
})

// ============================================================
// 📋 GET /chat/:sessionId/history - Xem lịch sử session
// ============================================================
app.get('/chat/:sessionId/history', (req, res) => {
  const { sessionId } = req.params
  const history = sessionStore.get(sessionId) || []
  return res.json({
    sessionId,
    messageCount: history.length,
    messages: history,
  })
})

// Khởi động Mastra (dùng endpoint mặc định /api/agents/...)
const mastraServer = new MastraServer({ app, mastra })
await mastraServer.init()

app.get('/', (req, res) => {
  res.send('Server + Mastra Agent đang chạy!')
})

app.listen(PORT, () => {
  console.log(`🚀 Server chạy: http://localhost:${PORT}`)
  console.log(`💬 Chat API: POST http://localhost:${PORT}/chat`)
})

/*
========= CÁCH DÙNG API MỚI =========
⚠️  Dùng /chat (KHÔNG dùng /api/chat vì Mastra chiếm /api/*)

1️⃣ Bắt đầu hoặc tiếp tục hội thoại:
POST http://localhost:3000/chat
{
  "sessionId": "user-123",
  "message": "Giúp tôi order bàn gỗ"
}

2️⃣ Tiếp tục trả lời (cùng sessionId):
POST http://localhost:3000/chat
{
  "sessionId": "user-123",
  "message": "Tên tôi là Nguyễn Văn A, số 0123456789, địa chỉ Hà Nội"
}

3️⃣ Reset hội thoại:
DELETE http://localhost:3000/chat/user-123

4️⃣ Xem lịch sử:
GET http://localhost:3000/chat/user-123/history
*/
